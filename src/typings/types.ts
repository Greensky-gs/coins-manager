export type account = {
    user_id: string;
    guild_id: string;
    bank: number;
    coins: number;
}
export type CoinsInput<B extends boolean = true, C extends boolean = true> = {
    guild_id: string;
    user_id: string
} & (B extends true ? { bank: number } : {}) & (C extends true ? { coins: number } : {});
