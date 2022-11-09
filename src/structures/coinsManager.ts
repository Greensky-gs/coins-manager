import { Connection } from "mysql";
import { account, CoinsInput } from "../typings/types";

export class CoinsManager {
    private db: Connection;
    private cache: Map<string, account> = new Map();

    constructor(database: Connection) {
        this.db = database;
    }
    public start() {
        this.fillCache();
        this.query(`CREATE TABLE IF NOT EXISTS coins ( guild_id VARCHAR(255) NOT NULL, user_id VARCHAR(255) NOT NULL, coins INTEGER(255) NOT NULL DEFAULT '0', bank INTEGER(255) NOT NULL DEFAULT '0' );`);
    }
    public addCoins(inp: CoinsInput<false, true>): account {
        const dt = this.getData(inp);
        dt.coins+= inp.coins;

        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public removeCoins(inp: CoinsInput<false, true>): account | 'not enough coins' {
        const dt = this.getData(inp);
        if (dt.coins < inp.coins) return 'not enough coins';

        dt.coins -= inp.coins;
        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public addBank(inp: CoinsInput<true, false>): account {
        const dt = this.getData(inp);
        dt.bank += inp.bank;

        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public removeBank(inp: CoinsInput<true, false>): account | 'not enough coins' {
        const dt = this.getData(inp);
        if (dt.coins < inp.bank) return 'not enough coins';

        dt.coins -= inp.bank;
        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public getCode({ guild_id, user_id }: CoinsInput<false, false>) {
        return `${guild_id}.${user_id}`;
    }
    public getData(inp: CoinsInput<boolean, boolean>): account {
        return this.cache.get(this.getCode(inp)) ?? { coins: 0, bank: 0, user_id: inp.user_id, guild_id: inp.user_id };
    }
    public hasAccount(inp: CoinsInput<false, false>) {
        return this.cache.has(this.getCode(inp));
    }
    public getLeaderboard(guild_id?: string) {
        let lb = this.array;

        if (guild_id) lb = lb.filter(x => x.guild_id === guild_id);
        return lb.sort((a, b) => (a.coins + b.bank) - (b.coins - b.bank));
    }

    public get array() {
        const arr: account[] = [];
        this.cache.forEach(d => {
            arr.push(d);
        })

        return arr;
    }

    private buildQueryForUser(inp: account) {
        const data = this.getData(inp);
        if (this.hasAccount(inp)) return `UPDATE coins SET coins="${data.coins}", bank="${data.bank}" WHERE user_id='${data.user_id}' AND guild_id='${data.guild_id}'`;
        return `INSERT INTO coins (guild_id, user_id, coins, bank) VALUES ('${data.guild_id}', '${data.user_id}', '${data.coins}', '${data.bank}')`;
    }
    private async fillCache() {
        const dts = await this.query('SELECT * FROM coins');
        this.cache.clear();

        for (const dt of dts) {
            this.cache.set(this.getCode(dt), dt);
        }
    }
    private query<R = any>(query: string): Promise<R[]> {
        return new Promise((resolve, reject) => {
            this.db.query(query, (error, request) => {
                if (error) return reject(error);
                resolve(request);
            })
        })
    }
}
