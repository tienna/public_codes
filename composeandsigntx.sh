##  --testnet-magic 2 is preview, block time is one day

cardano-cli query utxo --address $(cat $BASENAME.payment-1H.addr) --testnet-magic 2

cardano-cli query protocol-parameters \
   --testnet-magic 2 \
   --out-file protocol.json

cardano-cli transaction build  \
    --babbage-era  \
    --testnet-magic 2 \
    --tx-in "ba2fb048bf779ecb504874cdd8593565a2a75df33c793ac4f18484e67ebed970#1"  \
    --tx-out "addr_test1qqvs0s00n8hjzmyypklvlc6swm7ck0vn7g9c6krgv6kn94qy6j8z2za8e0s3drja9zdnvql3x6j5va2f20zauqe7mzws8w0akz+9000000" \
     --change-address $(cat $BASENAME.payment-1H01.addr) \
--protocol-params-file protocol.json  \
--out-file body.tx


cardano-cli transaction sign \
   --tx-body-file body.tx \
   --testnet-magic 2 \
   --signing-key-file $BASENAME.payment-1H01.skey \
   --out-file signed.tx

cardano-cli transaction submit --tx-file signed.tx --testnet-magic 2
