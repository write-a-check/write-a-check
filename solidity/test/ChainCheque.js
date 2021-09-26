const {randomBytes} = require("@ethersproject/random")
const {expect} = require("chai")


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function deadline(s) {
    return Math.floor(Date.now() / 1000) + s
}

describe("Chain Cheque contract", function () {

    let token
    let owner
    let payee
    let referee
    let cheque
    let tokenCode
    let chequeCode
    let hash
    let sep206 = '0x0000000000000000000000000000000000002711'

    before(async function () {
        [owner, payee, referee] = await ethers.getSigners()
        tokenCode = await ethers.getContractFactory("TestToken");
        chequeCode = await ethers.getContractFactory("ChainCheque")
        hash = ethers.utils.keccak256("0x1234")
    })

    beforeEach(async function () {
        token = await tokenCode.deploy();
        cheque = await chequeCode.deploy()
        await token.approve(cheque.address, 10000)
    });

    it("Test cheque write", async function () {
        await expect(
            cheque.writeCheque(payee.address, token.address, 100, deadline(10), 1, randomBytes(1))
        ).to.be.revertedWith("no-enc-pubkey");

        await cheque.connect(payee).setEncryptionPubkey(1, referee.address)
        expect(await cheque.encryptionPubkeys(payee.address)).to.equal(1)

        await expect(
            cheque.writeCheque(payee.address, token.address, 100, deadline(3600 * 24 * 31), 1, randomBytes(1))
        ).to.be.revertedWith("deadline-must-in-one-month");

        let tx = await cheque.writeCheque(payee.address, token.address, 100, deadline(10), hash, randomBytes(1))
        let receipt = await tx.wait()
        expect(receipt.events[2].args.payee).to.equal(payee.address)
        expect(receipt.events[2].args.drawer).to.equal(owner.address)
        let balance = await token.balanceOf(cheque.address)
        expect(balance.toNumber()).to.equal(100)
    });

    it("Test cheque revoke", async function () {
        await cheque.connect(payee).setEncryptionPubkey(1, referee.address)
        let tx = await cheque.writeCheque(payee.address, token.address, 100, deadline(15), hash, randomBytes(1))
        let receipt = await tx.wait()
        await sleep(10000);
        await cheque.revokeCheque(receipt.events[2].args.id)
        let balance = await token.balanceOf(owner.address)
        expect(balance.toNumber()).to.equal(1000000)
    });

    it("Test cheque refuse", async function () {
        await cheque.connect(payee).setEncryptionPubkey(1, referee.address)
        let tx = await cheque.writeCheque(payee.address, token.address, 100, deadline(20), hash, randomBytes(1))
        let receipt = await tx.wait()

        await cheque.connect(payee).refuseCheque(receipt.events[2].args.id)
        let balance = await token.balanceOf(owner.address)
        expect(balance.toNumber()).to.equal(1000000)
    });

    it("Test cheque accept", async function () {
        await cheque.connect(payee).setEncryptionPubkey(1, referee.address)
        let tx = await cheque.writeCheque(payee.address, token.address, 100, deadline(25), hash, randomBytes(1))
        let receipt = await tx.wait()

        await expect(cheque.acceptCheque(receipt.events[2].args.id, "0x1234")).to.be.revertedWith('not-payee')
        await expect(cheque.connect(payee).acceptCheque(receipt.events[2].args.id, "0x1230")).to.be.revertedWith('wrong-passphrase')

        await cheque.connect(payee).acceptCheque(receipt.events[2].args.id, "0x1234")
        let balance = await token.balanceOf(cheque.address)
        expect(balance.toNumber()).to.equal(0)
        balance = await token.balanceOf(payee.address)
        expect(balance.toNumber()).to.equal(100)
    });

    it("Test cheque write batch", async function () {
        await expect(
            cheque.writeCheques([payee.address, referee.address], token.address, 100, deadline(30), [hash, hash], [randomBytes(1), randomBytes(2)])
        ).to.be.revertedWith("no-enc-pubkey");

        await cheque.connect(payee).setEncryptionPubkey(1, referee.address)
        await cheque.connect(referee).setEncryptionPubkey(2, referee.address)

        await expect(
            cheque.writeCheques([payee.address], token.address, 100, deadline(30), [hash, hash], [randomBytes(1), randomBytes(2)])
        ).to.be.revertedWith("length-mismatch");

        await expect(
            cheque.writeCheques([payee.address, referee.address], token.address, 100, deadline(30), [hash, hash], [randomBytes(2)])
        ).to.be.revertedWith("length-mismatch");

        let tx = await cheque.writeCheques([payee.address, referee.address], token.address, 100,
            deadline(35), [hash, hash], [randomBytes(1), randomBytes(2)])
        let receipt = await tx.wait()
        expect(receipt.events[2].args.payee).to.equal(payee.address)
        expect(receipt.events[2].args.drawer).to.equal(owner.address)
        expect(receipt.events[3].args.payee).to.equal(referee.address)
        expect(receipt.events[3].args.drawer).to.equal(owner.address)
        let balance = await token.balanceOf(cheque.address)
        expect(balance.toNumber()).to.equal(2 * 100)
    });

    it("Test cheque write with native token", async function () {
        await expect(
            cheque.writeCheque(payee.address, sep206, 100, deadline(40), 1, randomBytes(1))
        ).to.be.revertedWith("value-mismatch");

        await cheque.connect(payee).setEncryptionPubkey(1, referee.address)
        let overrides = {
            value: '100'
        }
        let tx = await cheque.writeCheque(payee.address, sep206, 100, deadline(45), hash, randomBytes(1), overrides)
        let receipt = await tx.wait()
        expect(receipt.events[0].args.payee).to.equal(payee.address)
        expect(receipt.events[0].args.drawer).to.equal(owner.address)
        let balance = await ethers.provider.getBalance(cheque.address)
        expect(balance.toNumber()).to.equal(100)
    });
});

