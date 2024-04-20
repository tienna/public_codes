// Trang chủ Lucid tại  --> https://lucid.spacebudz.io/
// Trang chủ Blockfrost --> https://blockfrost.io 
// minting token tuan thu CIP25

import { Blockfrost, Lucid, fromText } from "https://deno.land/x/lucid/mod.ts";

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const ALICE_MNEMONIC = Deno.env.get("ALICE_MNEMONIC");
const lucid = await Lucid.new(
    new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0", BLOCKFROST_API_KEY,), "Preview",);

//Khai báo ví Alice
lucid.selectWalletFromSeed(ALICE_MNEMONIC);

//Tạo Minting Policy
const { paymentCredential } = lucid.utils.getAddressDetails(await lucid.wallet.address(),);
const mintingPolicy = lucid.utils.nativeScriptFromJson(
    {
        type: "all",
        scripts: [
            { type: "sig", keyHash: paymentCredential.hash },
            {
                type: "before",
                slot: lucid.utils.unixTimeToSlot(Date.now() + 1000000),
            },
        ],
    },
);
const asset_name = "VIETNAM"
const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
const unit = policyId + fromText(asset_name);
const filename = "ipfs://QmZcQwd5TEymQz9pmBsEZhTVdqscaEbfsnHNDEVf74MVkq";


const metadata = {
    [policyId]: {
        [asset_name]: {
            "description": "VIETNAM: The hidden charm",
            "id": "1",
            "image": filename,
            "name": asset_name
        }

    }
};

const tx = await lucid.newTx()
    .mintAssets({ [unit]: BigInt(1) }) //tên và số lượng
    .attachMetadata(721, metadata) //attachMetadata  
    .validTo(Date.now() + 200000)
    .attachMintingPolicy(mintingPolicy)
    .complete();
const signedTx = await tx.sign().complete();
const txHash = await signedTx.submit();
console.log(`ID giao dịch là ${txHash}`)


