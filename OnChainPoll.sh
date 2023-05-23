#huong dan =https://github.com/cardano-foundation/CIP-0094-polls

# download file cardano-cli 
wget  https://update-cardano-mainnet.iohk.io/cardano-node-releases/cardano-node-8.0.0-linux.tar.gz
tar xvf cardano-node-8.0.0-linux.tar.gz
cp cardano-cli /folder rieng  hoac   

 
 

#Tạo phiếu bầu
#1 lấy file poll.json từ  https://github.com/cardano-foundation/CIP-0094-polls/tree/main/networks/mainnet/fae7bda85acb99c513aeab5f86986047b6f6cbd33a8e11f11c5005513a054dc8

vilai@VILAI-DEV:~/OnChainPoll$ cat poll.json
{
    "type": "GovernancePoll",
    "description": "An on-chain poll for SPOs: Which setup would you prefer to be put in place from Q3 2023 onwards?",
    "cborHex": "a1185ea200827840576869636820736574757020776f756c6420796f752070726566657220746f2062652070757420696e20706c6163652066726f6d2051332032303233206f6e7765617264733f01868178284b656570206b2061742035303020616e64206d696e506f6f6c436f7374206174203334302061646181782e4b656570206b2061742035303020616e642068616c7665206d696e506f6f6c436f737420746f2031373020616461817832496e637265617365206b20746f203130303020616e64206b656570206d696e506f6f6c436f73742061742033343020616461817833496e637265617365206b20746f203130303020616e642068616c7665206d696e506f6f6c436f737420746f20313730206164618178194920776f756c642070726566657220746f206162737461696e81781c4e6f6e65206f66207468652070726f7669646564206f7074696f6e73"
}
 


#new command which has vote option, generate answer.json 

/home/cardano/OnChainPoll/cardano-cli governance answer-poll --poll-file poll.json >answer.json 
 
vilai@VILAI-DEV:~/OnChainPoll$ cat answer.json
{
    "94": {
        "map": [
            {
                "k": {
                    "int": 2
                },
                "v": {
                    "bytes": "96861fe7da8d45ba5db95071ed3889ed1412929f33610636c072a4b5ab550211"
                }
            },
            {
                "k": {
                    "int": 3
                },
                "v": {
                    "int": 3
                }
            }
        ]
    }
vilai@VILAI-DEV:~/

#Lấy địa Pool ID tại website https://adastat.net/pools/
#tạo địa chỉ pool ở format Bech32

bech32 <<< pool1u7zrgexnxsysctnnwljjjymr70he829fr5n3vefnv80guxr42dv
>>>>e7843464d334090c2e7377e5291363f3ef93a8a91d2716653361de8e

ADDRESS=addr1qxjmrz2p3adtgrhr9rqp9clhvmdwp0d7umjzwwqr430t5k3f5uzhelg06zvsrkfwts97k3wh8krg5z3wvqgugvwtjghs6exru7

cardano-cli query utxo --address $ADDRESS --mainnet
POOL_ID=e7843464d334090c2e7377e5291363f3ef93a8a91d2716653361de8e
TXID=e21a6971489dea9dddd60fe277efc3a7b08eb694b4703ddea49afc2ae545f52d#0



cardano-cli transaction build \
    --babbage-era \
    --cardano-mode \
    --mainnet \
    --tx-in $TXID \
    --change-address $ADDRESS \
    --metadata-json-file answer.json \
    --json-metadata-detailed-schema \
    --required-signer-hash $POOL_ID \
    --out-file answer.tx
	
	
#sign the transaction
/home/vilai/.cabal/bin/cardano-cli transaction sign \
    --tx-body-file /home/vilai/OnChainPoll/answer.tx \
    --signing-key-file /path to wallet key/payment.skey \
    --signing-key-file /path to pool key/cold.skey \
    --mainnet \
    --out-file /home/vilai/OnChainPoll/tx.signed



   
#send the transaction
cardano-cli transaction submit \
    --tx-file tx.signed \
    --mainnet	
	
