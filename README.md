
# coins-manager

Source code of [coins manager](https://www.npmjs.com/package/coins-manager)

This manager can be configured for a global usage or to split economy servers.

## Important

This manager works with MySQL.

## Documentation

Here is how to use the manager

First install the package (`yarn add coins-manager`, `npm i coins-manager` or `pnpm add coins-manager`)

*Typescript initialisation*

```ts
import { CoinsManager } from 'coins-manager';
import { createConnection } from 'mysql';

const database = createConnection({/* database informations */})

const manager = new CoinsManager<'global' | 'multiguild'>(database, {
    options: 'global' | 'multiguild'
});
manager.start();
```

*Javascript initialisation*

```js
const { CoinsManager } = require('coins-manager');
const { createConnection } = require('mysql');

const database = createConnection({/* database informations */})

const manager = new CoinsManager<'global' | 'multiguild'>(database, {
    options: 'global' | 'multiguild'
});
manager.start();
```

## Returns

The manager return this format :

```ts
{
    coins: number;
    bank: number;
    user_id: string;
}
```

And if it's set to a multiguild usage :

```ts
{
    guild_id: string;
    user_id: string;
    coins: number;
    bank: number;
}
```

### Methods

Here are the documentation for the methods

Remember that if you set it on a multiguild usage, it will require a `guild_id` parameter

#### Add Coins

Add coins to an user

```ts
manager.addCoins({
    user_id: '1234',
    coins: 100
    // Optional guild_id: '4321' value is required for a multiguild usage
});
```

#### Remove Coins

Remove coins to an user

```ts
manager.removeCoins({
    user_id: '1234',
    coins: 100
    // Optional guild_id: '4321' value is required for a multiguild usage
});
```

#### Add bank

Add bank amount to an user

```ts
manager.addBank({
    user_id: '1234',
    bank: 100
    // Optional guild_id: '4321' value is required for a multiguild usage
});
```

#### Remove bank

Remove coins in bank from an user

```ts
manager.removeBank({
    user_id: '1234',
    bank: 100
    // Optional guild_id: '4321' value is required for a multiguild usage
});
```

#### Get leaderboard

This method returns the leaderboard of coins + bank

```ts
manager.getLeaderboard();
```

If you set it to a multiguild usage, you can add `guild_id` parameter to get the leaderboard of a specific server

```ts
manager.getLeaderboard('4321');
```

#### Get Data

Get the data of an user

```ts
manager.getData({
    user_id: '1324'
});
```

If you set it to a multiguild usage, you have to add the `guild_id` paramter :

```ts
manager.getData({
    user_id: '1324',
    guild_id: '4321'
});
```

#### Get Code

The manager's cache works with a code system, in a global usage it's just the user ID, but if you set it to a multiguild usage, you maybe want to get the code of the user, so use :

```ts
manager.getCode({
    user_id: '1234'
})
```

And for multiguild usage :

```ts
manager.getCode({
    user_id: '1324',
    guild_id: '4321'
});
```

#### Has Account

This method is used to know if a user is in the database

```ts
manager.hasAccount({
    user_id: '1324'
});
// Boolean
```

And on a multiguild usage :

```ts
manager.hasAccount({
    user_id: '1234',
    guild_id: '4321'
});
// Boolean
```

### Propreties

Here are **the** proprety of the manager : `array`

This get method returns you an array with all the [returns data](#returns)
