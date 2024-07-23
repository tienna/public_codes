import {
    Address,
    Blockfrost,
    Constr,
    Data,
    Lucid,
    SpendingValidator,
    TxHash,
  } from "https://deno.land/x/lucid@0.10.7/mod.ts";
 import {utf8ToHex,} from "https://deno.land/x/lucid@0.6.5/mod.ts";
  const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4QbiejGzlyhUgfvyXZNf8lDEIFjCHjP0",),"Preview",);
  
  //===============Active Bob Wallet ==============================
  const Bob_mnonic = "lottery novel civil green oppose whip offer correct mushroom cricket awkward vague shine another tree boss there perfect asset side release song wedding captain";
  lucid.selectWalletFromSeed(Bob_mnonic);
  /*
    AlwaysSucceeds Example
    Lock a UTxO with some ADA
    UTxO can be unlocked by anyone
    Showcasing PlutusV2
  
    Contract:
  
    validate :: () -> () -> ScriptContext -> Bool
    validate _ _ _ = True
   */
   const mintingPolicy: SpendingValidator = {
    type: "PlutusV2",
    script: "49480100002221200101",
  };
  const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
  const alwaysSucceedAddress: Address = lucid.utils.validatorToAddress(mintingPolicy,);
  
type Metadata = {
    name: string;
    image: string;
}; 
 const Redeemer = () => Data.void();
  
  export async function mintNFT(
    assetName: string,
    metadata: Metadata,
  ): Promise<TxHash> {
    const refNft = policyId + '000643b0' + utf8ToHex(assetName); // tính ra tên refNFT
    const userToken = policyId + '000de140' + utf8ToHex(assetName);
    const datumMetadata = Data.to(new Constr(0, [Data.fromJson(metadata), 1n])); 

    const tx = await lucid
      .newTx()
   //   .payToContract(alwaysSucceedAddress, { inline: Datum}, { lovelace })
      .mintAssets({ [refNft]: 1n, [userToken]: 1n },Redeemer() )// mint refNft and user token pair
      .payToContract(alwaysSucceedAddress, datumMetadata, { [refNft]: 1n }) // send userToken to user wallet address
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
    const [refUtxo] = await lucid.utxosAtWithUnit(alwaysSucceedAddress, refNft); // tim ra refUTXO
    const datumMetadata = Data.to(new Constr(0, [Data.fromJson(metadata), 2n]));
    const tx = await lucid.newTx()
        .collectFrom([refUtxo],Redeemer())
        .payToContract(alwaysSucceedAddress, datumMetadata, { [refNft]: 1n }) // send userToken to user wallet address
        .attachSpendingValidator(mintingPolicy)
        .complete();
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    return txHash;

}
const txHash=await mintNFT("MK", { name: "MONKEY", image: "ipfs://Qme49fCRJ1CNcUCWEhG75b53vZ8tpBLyvmEhNwPYyCXpn5" });
console.log(`Giao dịch thành công với TX-ID: ${txHash}`)


//   const txHash=await mintNFT("HCM-CWG", { name: "Warm-up", image: "ipfs://QmXdny7WMQrHsydwbynJi2icTP9Rhh9D8SWdMtXZxfFsdH" });
//   console.log(`Giao dịch thành công với TX-ID: ${txHash}`)

//   const txHash=await redeemUtxo();
//   console.log(`Giao dịch thành công với TX-ID: ${txHash}`)

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