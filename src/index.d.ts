import { TypeT, account, CoinsInput } from './typings/types';
import { Connection } from 'mysql';

export class CoinsManager<T extends TypeT> {
    public constructor(
        database: Connection,
        options?: {
            type?: T;
        }
    );
    public start(): void;
    public addCoins(inp: CoinsInput<T, false>): account<T>;
    public removeCoins(inp: CoinsInput<T, false>): account<T>;
    public addBank(inp: CoinsInput<T, true, false>): account<T>;
    public removeBank(inp: CoinsInput<T, true, false>): account<T>;
    public getLeaderboard(inp: T extends 'multiguild' ? string : null): account<T>[];

    public getCode(inp: CoinsInput<T, false, false>): string;
    public getData(inp: CoinsInput<T, false, false>): string;
    public hasAccount(inp: CoinsInput<T, false, false>): string;

    public get array(): account<T>[];
}
