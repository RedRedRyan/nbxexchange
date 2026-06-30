import { Magic } from 'magic-sdk';
import { HederaExtension } from '@magic-ext/hedera';

const magic = new Magic("pk_live_0018166BD8A4181E" , {
    extensions: [new HederaExtension({
        network: 'testnet' // 'mainnet' or 'testnet'
    })]
});