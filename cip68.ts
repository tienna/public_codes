import {
    Address,
    Blockfrost,
    Constr,    
    Data,
    Lucid,
    SpendingValidator,
    TxHash,
    fromHex,
    fromText,
    toHex,
  } from "https://deno.land/x/lucid@0.10.7/mod.ts";
 
// test passed: these code has been ran well
 import {utf8ToHex} from "https://deno.land/x/lucid@0.8.3/mod.ts";
 const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4QbiejGzlyhUgfvyXZNf8lDEIFjCHjP0",),"Preview",);
  
  //===============Active Bob Wallet ==============================
  const Bob_mnonic = "lottery novel civil green oppose whip offer correct mushroom cricket awkward vague shine another tree boss there perfect asset side release song wedding captain";
  lucid.selectWalletFromSeed(Bob_mnonic);
  
//===============Đọc mã CBOR của SC  ============================
// async function readValidator(): Promise<SpendingValidator> {
//     const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
//         return {
//           type: "PlutusV2",
//           script: toHex(cbor.encode(fromHex(validator.compiledCode))),
//         };
//       }

// const validator = await readValidator();
// const policyId = lucid.utils.mintingPolicyToId(validator);
// const avalidator_Address: Address = lucid.utils.validatorToAddress(validator,);

const mintingPolicy: SpendingValidator = {
  type: "PlutusV2",
  script: "49480100002221200101",
};
const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
const avalidator_Address: Address = lucid.utils.validatorToAddress(mintingPolicy,);


const ownerPublicKeyHash = lucid.utils.getAddressDetails(await lucid.wallet.address()).paymentCredential.hash;  

type Metadata = {
    name: string;
    image: string;
    owner: string;
  //  version: string;
  };

const Datum = {
      name: "INDIA-FLAG", 
      image:"ipfs://QmbneFHiFLDnBcnA24VzDB7opGxLnSipEBygjWMD2xHqv5", 
      owner:ownerPublicKeyHash,
    // version:fromText("1"), 
  } 
console.log(Datum)
const Redeemer = () => Data.void();
export async function mintNFT(
    assetName: string,
    metadata: MyDatum,
  ): Promise<TxHash> {
    const refNft = policyId + '000643b0' + utf8ToHex(assetName); // tính ra tên refNFT
    const userToken = policyId + '000de140' + utf8ToHex(assetName);
const datumMetadata = Data.to(new Constr(0, [Data.fromJson(metadata), 1n]));
console.log(metadata)

    const tx = await lucid
      .newTx()
      .mintAssets({ [refNft]: 1n, [userToken]: 1n },Redeemer() )// mint refNft and user token pair
      .payToContract(avalidator_Address, datumMetadata, { [refNft]: 1n }) // send userToken to user wallet address
      .payToAddress(await lucid.wallet.address(), { [userToken]: 1n })
      .attachMintingPolicy(mintingPolicy)
      .complete();
  
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    return txHash;
  }

  export async function updateNFT(assetName: string, metadata: Metadata,): Promise<TxHash> {
    const refNft = policyId + '000643b0' + utf8ToHex(assetName); // tính ra tên refNFT
   // const userToken = policyId + '000de140' + utf8ToHex(assetName);
    const [refUtxo] = await lucid.utxosAtWithUnit(avalidator_Address, refNft); // tim ra refUTXO
    const datumMetadata = Data.to(new Constr(0, [Data.fromJson(metadata), 2n]));
    const tx = await lucid.newTx()
        .collectFrom([refUtxo],Redeemer())
        .payToContract(avalidator_Address, datumMetadata, { [refNft]: 1n }) // send userToken to user wallet address
        .attachSpendingValidator(mintingPolicy)
        .complete();
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    return txHash;

}
const txHash=await mintNFT("IND",Datum);
console.log(`Giao dịch thành công với TX-ID: ${txHash}`)

// const txHash=await updateNFT("SHOES68",Datum);
// console.log(`Giao dịch update  metadata thành công với TX-ID: ${txHash}`)

 

  export async function redeemUtxo(): Promise<TxHash> {
    const referenceScriptUtxo = (await lucid.utxosAt(alwaysSucceedAddress)).find(
      (utxo) => Boolean(utxo.scriptRef),
    );
    if (!referenceScriptUtxo) throw new Error("Reference script not found");
  
    const utxo = (await lucid.utxosAt(alwaysSucceedAddress)).find((utxo) =>
      utxo.datum === Datum 
    //&& !utxo.scriptRef
    );
    if (!utxo) throw new Error("Spending script utxo not found");
    console.log(utxo);
    const tx = await lucid
      .newTx()
     // .readFrom([referenceScriptUtxo]) // spending utxo by reading plutusV2 from reference utxo
      .collectFrom([utxo], Redeemer())
      .attachSpendingValidator(alwaysSucceedScript)
      .complete();
  
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    return txHash;
  }