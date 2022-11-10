export type TypeT = 'multiguild' | 'global';
export type account<T extends TypeT> = {
    user_id: string;
    bank: number;
    coins: number;
} & (T extends 'multiguild' ? { guild_id: string } : {});
export type CoinsInput<T extends TypeT, B extends boolean = true, C extends boolean = true> = {
    user_id: string;
} & (B extends true ? { bank: number } : {}) &
    (C extends true ? { coins: number } : {}) &
    (T extends 'multiguild' ? { guild_id: string } : {});
