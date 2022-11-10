import { Connection } from 'mysql';
import { account, CoinsInput, TypeT } from '../typings/types';

export class CoinsManager<T extends TypeT> {
    private db: Connection;
    private cache: Map<string, account<T>> = new Map();
    readonly type: TypeT;

    constructor(
        database: Connection,
        options?: {
            type?: T;
        }
    ) {
        this.db = database;
        this.type = options?.type ?? 'multiguild';
    }
    public start() {
        this.fillCache();
        this.query(
            `CREATE TABLE IF NOT EXISTS coins ( ${
                this.type === 'multiguild' ? 'guild_id VARCHAR(255) NOT NULL, ' : ''
            }user_id VARCHAR(255) NOT NULL, coins INTEGER(255) NOT NULL DEFAULT '0', bank INTEGER(255) NOT NULL DEFAULT '0' );`
        );
    }
    public addCoins(inp: CoinsInput<T, false, true>): account<T> {
        const dt = this.getData(inp);
        dt.coins += inp.coins;

        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public removeCoins(inp: CoinsInput<T, false, true>): account<T> | 'not enough coins' {
        const dt = this.getData(inp);
        if (dt.coins < inp.coins) return 'not enough coins';

        dt.coins -= inp.coins;
        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public addBank(inp: CoinsInput<T, true, false>): account<T> {
        const dt = this.getData(inp);
        dt.bank += inp.bank;

        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public removeBank(inp: CoinsInput<T, true, false>): account<T> | 'not enough coins' {
        const dt = this.getData(inp);
        if (dt.coins < inp.bank) return 'not enough coins';

        dt.coins -= inp.bank;
        this.cache.set(this.getCode(inp), dt);
        this.query(this.buildQueryForUser(dt));
        return dt;
    }
    public getCode(inp: CoinsInput<T, false, false>): string {
        if (this.global) return inp.user_id;
        return `${(inp as CoinsInput<'multiguild'>).guild_id}.${inp.user_id}`;
    }
    public getData(inp: CoinsInput<T, false, false>): account<T> {
        let r = this.cache.get(this.getCode(inp));
        if (!r) {
            if (this.global) (r as account<'global'>) = { coins: 0, bank: 0, user_id: inp.user_id };
            else r = { coins: 0, bank: 0, guild_id: (inp as CoinsInput<'multiguild'>).guild_id, user_id: inp.user_id };
        }

        return r;
    }
    public hasAccount(inp: CoinsInput<T, false, false>) {
        return this.cache.has(this.getCode(inp));
    }
    public getLeaderboard(inp: T extends 'multiguild' ? string : null) {
        let lb = this.array;

        if (!this.global && inp) lb = (lb as account<'multiguild'>[]).filter((x) => x.guild_id === inp);
        return lb.sort((a, b) => a.coins + b.bank - (b.coins - b.bank));
    }

    public get array() {
        const arr: account<T>[] = [];
        this.cache.forEach((d) => {
            arr.push(d);
        });

        return arr;
    }

    private buildQueryForUser(inp: account<T>): string {
        const data = this.getData(inp);
        if (this.global) return this.buildGlobalQuery(inp, data);
        return this.buildMutliQuery(inp as account<'multiguild'>, data as account<'multiguild'>);
    }
    private buildGlobalQuery(inp: account<'global'>, data: account<'global'>): string {
        if (this.hasAccount(inp as account<T>))
            return `UPDATE coins SET coins="${data.coins}", bank="${data.bank}" WHERE user_id='${data.user_id}'`;
        return `INSERT INTO coins (guild_id, user_id, coins, bank) VALUES ('${data.user_id}', '${data.coins}', '${data.bank}')`;
    }
    private buildMutliQuery(inp: account<'multiguild'>, data: account<'multiguild'>): string {
        if (this.hasAccount(inp))
            return `UPDATE coins SET coins="${data.coins}", bank="${data.bank}" WHERE user_id='${data.user_id}' AND guild_id='${data.guild_id}'`;
        return `INSERT INTO coins (guild_id, user_id, coins, bank) VALUES ('${data.guild_id}', '${data.user_id}', '${data.coins}', '${data.bank}')`;
    }
    private get global(): boolean {
        return this.type === 'global';
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
            });
        });
    }
}
