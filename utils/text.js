const meta = {
    name : "mibox",
}

export const commands = {
    base: {
        name: "mibox",
        help: []
    },
    loc: {
        name: "mibox-loc",
        help: []
    },
    bind: {
        name: "mibox-bind",
        help: []
    },
    help: {
        name: "mibox-help",
        help: []
    }
};

export const syntax_color = {
    "cmd": "§3",
    "sub": "§b",
    "arg": "§9"
}

// commands.loc.help を後から定義
commands.loc.help = [
    {
        syntax: `/${commands.loc.name} append <id> [X] [Y] [Z]`,
        description: "§a登録座標を追加します。座標を選択しない場合は現在の座標を追加します。§r"
    },
    {
        syntax: `/${commands.loc.name} pop [id] [X] [Y] [Z]`,
        description: "§a登録座標を削除します。何も指定しない場合現在座標を、idのみを指定する場合そのidを持つ座標全てを対象に取ります。§r"
    },
    {
        syntax: `/${commands.loc.name} list`,
        description: "§a登録座標を表示します。§r"
    },
    {
        syntax: `/${commands.loc.name} size <id> <dx> <dy> <dz>`,
        description: "§aidに該当する座標のboxサイズをdx,dy,dzに変更します。§r"
    },
    {
        syntax: `/${commands.loc.name} move <id> <dx> <dy> <dz>`,
        description: "§aidに該当する座標boxをdx,dy,dz分移動します。§r"
    }
];

// syntax color にcolorを付ける


// commands.bind.help を後から定義
commands.bind.help = [
    {
        syntax: `/${commands.bind.name} set <id> <key|command>`,
        description: "§a特定のidを踏んだ時、/から始まるコマンドをDに割り当てます。ただし、コマンドとキーは独立してキーを持ちます。§r"
    },
    {
        syntax: `/${commands.bind.name} set <id> toast <str>`,
        description: "§a特定のidを踏んだ時、strをwindowsのtoastに表示します。(windowsのみ)§r"
    },
    {
        syntax: `/${commands.bind.name} list`,
        description: "§aキー情報を表示します§r"
    },
    {
        syntax: `/${commands.bind.name} pop <id>`,
        description: "§a特定のidのキー割り当て情報を削除します。§r"
    }
];



export const SendChat = (msg) => {
    ChatLib.chat(`&6[&e${meta.name}&r&6]&r ${msg}`);
}