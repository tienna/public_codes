##1-Setup Environment parameters===
BASENAME=Alice
MNEMONIC=./Alice.monic

##2-create payment key pair===
cardano-address key from-recovery-phrase Shelley < $MNEMONIC > $BASENAME.root.xsk

##3-Derive addr.xsk and stake.xsk with chain code ( Derive from Parent key to Child Private key)
cardano-address key child 1852H/1815H/2H/0/0 < $BASENAME.root.xsk > $BASENAME.payment-2H.xsk  
cardano-address key child 1852H/1815H/2H/2/0 < $BASENAME.root.xsk > $BASENAME.stake-2H.xsk
## we can create cardano-address key child 1852H/1815H/2H/0/1 < $BASENAME.root.xsk > $BASENAME.payment-2H01.xsk  as a child extended singing key

##4-Derive Child Payment(0) and Stake(2) public key from their private key
cardano-address key public --with-chain-code < $BASENAME.payment-2H.xsk  > $BASENAME.payment-2H.vkey
cardano-address key public --without-chain-code < $BASENAME.stake-2H.xsk > $BASENAME.stake-2H.vkey

##OR Both 3 &4 at same command lines
#cardano-address key child 1852H/1815H/1H/0/0 < $BASENAME.root.xsk | cardano-address key public --with-chain-code >$BASENAME.payment-2H00.vkey
#cardano-address key child 1852H/1815H/1H/2/0 < $BASENAME.root.xsk | cardano-address key public --without-chain-code >$BASENAME.stake-2H00.vkey
 

#create child wallet'address 
cardano-cli address build --testnet-magic 2 \
                          --payment-verification-key-file $BASENAME.payment-2H.vkey \
                          --stake-verification-key-file $BASENAME.stake-2H.vkey \
                          --out-file $BASENAME.payment-2H.addr
cardano-cli query utxo --testnet-magic 2 --address $(cat $BASENAME.payment-2H.addr)

## convert Singning key to shelley format
cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file $BASENAME.payment-1H01.xsk  --out-file $BASENAME.payment-1H01.skey
cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file $BASENAME.stake-2H.xsk --out-file $BASENAME.stake-2H.skey

