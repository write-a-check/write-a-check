const {randomBytes} = require("@ethersproject/random")
const {expect} = require("chai")


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe("Chain Cheque contract", function () {

    let token
    let owner
    let payee
    let referee
    let cheque

    beforeEach(async function () {
        const tokenCode = await ethers.getContractFactory("TestToken");
        token = await tokenCode.deploy();
        [owner, payee, referee] = await ethers.getSigners()
        const chequeCode = await ethers.getContractFactory("ChainCheque")
        cheque = await chequeCode.deploy()
        await token.approve(cheque.address, 10000)
    });

    it("Test cheque actions", async function () {
        const deadline = Math.floor(Date.now() / 1000) + 10
        await expect(
            cheque.writeCheque(payee.address, token.address, 100, deadline, 1, randomBytes(1))
        ).to.be.revertedWith("no-enc-pubkey");

        //write
        await cheque.connect(payee).setEncryptionPubkey(1, referee.address)
        expect(await cheque.encryptionPubkeys(payee.address)).to.equal(1)
        let hash = ethers.utils.keccak256("0x1234")
        let tx = await cheque.writeCheque(payee.address, token.address, 100, deadline, hash, randomBytes(1))
        let receipt = await tx.wait()
        expect(receipt.events[2].args.payee).to.equal(payee.address)
        expect(receipt.events[2].args.drawer).to.equal(owner.address)
        let balance = await token.balanceOf(cheque.address)
        expect(balance.toNumber()).to.equal(100)
        let content = await cheque.getChequeContent(receipt.events[2].args.id)
        expect(content.coinType).to.equal(token.address)
        expect(content.deadline).to.equal(deadline)
        expect(content.passphraseOrHashtag).to.equal(hash)

        //accept
        await expect(cheque.acceptCheque(receipt.events[2].args.id, "0x1234")).to.be.revertedWith('not-payee')
        await cheque.connect(payee).acceptCheque(receipt.events[2].args.id, "0x1234")
        balance = await token.balanceOf(cheque.address)
        expect(balance.toNumber()).to.equal(0)
        balance = await token.balanceOf(payee.address)
        expect(balance.toNumber()).to.equal(100)
        content = await cheque.getChequeContent(receipt.events[2].args.id)
        expect(content.deadline).to.equal(0)

        //revoke
        tx = await cheque.writeCheque(payee.address, token.address, 100, deadline, hash, randomBytes(1))
        receipt = await tx.wait()
        await sleep(10000);
        await cheque.revokeCheque(receipt.events[2].args.id)
        content = await cheque.getChequeContent(receipt.events[2].args.id)
        expect(content.deadline).to.equal(0)
        balance = await token.balanceOf(owner.address)
        expect(balance.toNumber()).to.equal(1000000-100)

        //refuse
        tx = await cheque.writeCheque(payee.address, token.address, 100, deadline+10, hash, randomBytes(1))
        receipt = await tx.wait()
        await cheque.connect(payee).refuseCheque(receipt.events[2].args.id)
        content = await cheque.getChequeContent(receipt.events[2].args.id)
        expect(content.deadline).to.equal(0)
        balance = await token.balanceOf(owner.address)
        expect(balance.toNumber()).to.equal(1000000-100)
    });
});