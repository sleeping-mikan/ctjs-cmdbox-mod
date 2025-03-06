
import { renderBoxFromCorners} from "../BloomCore/RenderUtils";
import { commands, syntax_color, SendChat } from "./utils/text";
import { deepCopyObject } from "../BloomCore/utils/Utils";
import { profile, profileData, setProfileCallFunc } from "../MI";

const ClientCommandHandler = Java.type("net.minecraftforge.client.ClientCommandHandler");
const Minecraft = Java.type("net.minecraft.client.Minecraft");
const mc = Minecraft.func_71410_x();

let data = profileData.data;

const initData = () => {
    if (!data.cmdbox) {
        data.cmdbox = {};
    }
}
initData(); 

const CoolTimes = {
    PosCommands: 0,
    BindToast: 0
}

// プロフィール変更時に呼ばれる
function profileCallFunc (profileData) {
    data = profileData.data;
};
setProfileCallFunc(profileCallFunc);

const create_help_msg = ((item) => {
    // commands.loc.help は配列なので、forEach を使って処理
    let helpMessage = ""; // 結果を格納する文字列

    // 配列に対して forEach を使う
    commands[item].help.forEach((value) => {
        // cmd, sub, args を取り出し、syntax を再構成
        const cmd = value.syntax.split(" ")[0];
        const sub = value.syntax.split(" ")[1] || ""; // サブコマンドを取り出す（存在すれば）
        const args = value.syntax.split(" ").slice(2).join(" ") || ""; // 引数を取り出す（存在すれば）

        // 新しい構造に基づいて新しい syntax を作成
        const newSyntax = `${syntax_color.cmd}${cmd} ${syntax_color.sub}${sub} ${syntax_color.arg}${args}`;


        // coloredSyntax に色をつけて表示する
        helpMessage += `${newSyntax}\n${value.description}\n`;
    });

    return helpMessage; // 最終的な文字列を返す
})

const loc_help_msg = create_help_msg("loc");

const bind_help_msg = create_help_msg("bind");





// Skyblockエリアの取得
function getSkyblockArea() {
    const line = TabList.getNames().find(it => /^(Area|Garden): ([\w ]+)$/.test(it.removeFormatting()));
    if (line) {
        const match = line.removeFormatting().match(/^(Area|Garden): ([\w ]+)$/);
        if (match) return match[2];
    }
    return null;
}

let area = "";
// console.log(settings);
const createBoxDataIfNotExists = (area) => {
    // Gardenは読み込まない
    if (!area || area === "Garden") {
        return;
    }
    if (!data.cmdbox[area]) {
        data.cmdbox[area] = {};
    }
    if (!data.cmdbox[area].pos) {
        data.cmdbox[area].pos = {};
    }
    if (!data.cmdbox[area].bind) {
        data.cmdbox[area].bind = {};
    }
    if (!data.cmdbox[area].idcfg) {
        data.cmdbox[area].idcfg = {};
    }
    data.save();
}
// isInGarden
register("worldload", () => {
    let retryCount = 0; // リトライ回数のカウント
    const maxRetries = 15; // 最大リトライ回数
    const retryDelay = 1000; // 再試行までの遅延時間（ミリ秒）

    const reworldload = () => {
        area = getSkyblockArea();

        // エリアが取得できた場合
        if (area) {
            createBoxDataIfNotExists(area);
            return; // 処理終了
        }

        // エリアが取得できなかった場合
        area = "";
        retryCount++;
        if (retryCount <= maxRetries) {
            setTimeout(reworldload, retryDelay); // 再試行
        }
    };

    reworldload(); // 初回呼び出し
});

const minecraft = Client.getMinecraft(); //mc instance
const settings = minecraft.field_71474_y; //game settings

const runCommandKey = new KeyBind("run box command", Keyboard.KEY_N,"Mi");





register("renderWorld", () => {
    createBoxDataIfNotExists(area);
    if (area === "Garden" || !area) {
        // gardenコマンドはMiFmで実行
        return;
    }
    if (data.cmdbox[area].pos) {
        for (let id in data.cmdbox[area].pos) {
            for (let item in data.cmdbox[area].pos[id]) {
                let x = data.cmdbox[area].pos[id][item].x;
                let y = data.cmdbox[area].pos[id][item].y;
                let z = data.cmdbox[area].pos[id][item].z;
                let p = id;
                if (isNaN(id)){
                    p = 0
                    for (var i = 0; i < id.length; i ++)
                        p += id[i].charCodeAt(0);
                }
                // 色設定
                let r = p * 47 % 256, g = 255 - (p * 61 % 256), b = p * 125 % 256, alpha = 0.5;
                
                let [dx, dy, dz] = [1, 1, 1];
                // サイズ
                if (id in data.cmdbox[area].idcfg) {
                    if ("size" in data.cmdbox[area].idcfg[id]){
                        [dx, dy, dz] = [data.cmdbox[area].idcfg[id].size.dx, data.cmdbox[area].idcfg[id].size.dy, data.cmdbox[area].idcfg[id].size.dz];
                        if (dx < 0) x += 1;
                        if (dy < 0) y += 1;
                        if (dz < 0) z += 1;
                    }
                }
                // 描画
                renderBoxFromCorners(x, y, z, x + dx, y + dy, z + dz, r / 255, g / 255, b / 255, alpha, true, 2, true);
                renderBoxFromCorners(x, y, z, x + dx, y + dy, z + dz, r / 255, g / 255, b / 255, alpha, true, 2, false);
                let color = Renderer.color(r, g , b , alpha);
                Tessellator.drawString(id, x + dx / 2, dy > 0 ? y + dy + 0.5 : y + 0.5, z + dz / 2, color, false, 0.03, false);
            }
        }
    }
});



const get_player_pos = () => {
    x = Math.floor(Player.getX());
    y = Math.floor(Player.getY());
    z = Math.floor(Player.getZ());
    return [x,y,z];
}

const _append_marker = (x, y, z, id) => {
    const newPos = { x: x, y: y, z: z};

    // console.log(JSON.stringify(newPos));

    if (!data.cmdbox[area].pos) data.cmdbox[area].pos = {};
    if (!data.cmdbox[area].pos[id]) data.cmdbox[area].pos[id] = [];
    data.cmdbox[area].pos[id].push(newPos);

    // console.log(JSON.stringify(data.cmdbox[area]));

    data.save();
}

const append_marker = (x, y, z, id) => {
    // console.log(`call append_marker(${x}, ${y}, ${z}, ${id})`);
    if (id === undefined) {
        SendChat("&c引数が不足しています。/loc append <id> [X] [Y] [Z] の形式で入力してください。");
        return;
    }
    if (x !== undefined && (y === undefined || z === undefined)) {
        SendChat("&c座標が無効です。/loc append <id> [X] [Y] [Z] の形式で入力してください。");
        return;
    }
    if (x === undefined) {
        [x, y, z] = get_player_pos();
    }
    else {
        // x,y,zを数値に変換
        [x, y, z] = [Number(x), Number(y), Number(z)];
    }
    _append_marker(x, y, z, id);

    SendChat(`現在の座標を保存しました: X = ${x}, Y = ${y}, Z = ${z}, id = ${id}`);
}

const _pop_marker = (...args) => {
    const pop_marker_by_pos = (x, y, z, _id) => {
        for (let id in data.cmdbox[area].pos) {
            element = data.cmdbox[area].pos[id];
            // console.log("run" + element);
            if (_id !== undefined && id !== _id) continue;
            // console.log("run2" + element);
            for (let i = 0; i < element.length; i++) {
                let marker = element[i];
                if (marker.x === x && marker.y === y && marker.z === z) {
                    SendChat(`座標を削除しました: X = ${x}, Y = ${y}, Z = ${z}, id = ${id}`);
                    element.splice(i, 1);
                    data.save();
                    --i;
                }
            }
        }
    }
    if (args.length === 4) {
        (() => {
            const [x, y, z, id] = args;
            pop_marker_by_pos(x, y, z, id);
        })();
    }
    if (args.length === 3){
        (() => {
            const [x, y, z] = args;
            pop_marker_by_pos(x, y, z);
        })();
    }
    if (args.length === 1 && args[0] !== undefined) {
        (() => {
            const del_id = args[0];
            for (let id in data.cmdbox[area].pos) {
                // del_id == idなら削除
                if (id === del_id) {
                    delete data.cmdbox[area].pos[id];
                    data.save();
                } 
            }
        })();
    }
    if (args.length === 1 && args[0] === undefined) {
        (() => {
            [x, y, z] = get_player_pos();
            pop_marker_by_pos(x, y, z);
        })();
    }
}


const pop_marker = (x, y, z, id) => {
    // console.log(JSON.stringify(data.cmdbox[area]));
    if (x !== undefined && y !== undefined && z !== undefined && id !== undefined) {
        _pop_marker(x, y, z, id);
    }
    else if (x === undefined && id !== undefined) {
        _pop_marker(id);
    }
    else if (id === undefined && x === undefined) {
        _pop_marker(undefined);
    }
    else {
        SendChat("&c引数が不足しています。/loc pop [id] [X] [Y] [Z] の形式で入力してください。");
        return;
    }
    SendChat(`座標を削除しました: X = ${x}, Y = ${y}, Z = ${z}, id = ${id}`);
    // console.log(JSON.stringify(data.cmdbox[area]));
}

const list_markers = () => {
    SendChat("bind一覧");
    SendChat("===============================");
    if (!data.cmdbox[area].pos) data.cmdbox[area].pos = {};
    //中身をひとつづつ回す
    // console.dir(data.cmdbox[area].pos, {depth: null});
    // console.log(JSON.stringify(data.cmdbox[area]));
    for (let id in data.cmdbox[area].pos) {
        element = data.cmdbox[area].pos[id];

        for (let i = 0; i < element.length; i++) {
            let marker = element[i];
            SendChat(`id: ${id}, X: ${marker.x}, Y: ${marker.y}, Z: ${marker.z}`);
        }
    }; 
}

const ChangeSize = ( id, dx, dy, dz) => {
    if (isNaN(dx) || isNaN(dy) || isNaN(dz)){
        SendChat(`&c引数が無効です。/${commands.loc.name} size <id> <dx(float)> <dy(float)> <dz(float)> の形式で入力して下さい。`);
        return;
    }
    if (dz === undefined) {
        SendChat(`&c引数が不足しています。/${commands.loc.name} size <id> <dx> <dy> <dz> の形式で入力して下さい。`);
        return;
    }
    const [idx, idy, idz] = [Number(dx), Number(dy), Number(dz)];
    if (!(id in data.cmdbox[area].idcfg)){
        data.cmdbox[area].idcfg[id] = {}
    }
    // データを保存する
    data.cmdbox[area].idcfg[id].size = {dx: idx,dy: idy,dz: idz};

    data.save();
    SendChat(`boxのサイズを変更しました: id = ${id}, dx = ${idx}, dy = ${idy}, dz = ${idz}`);
}

const MovePlace = (id, x, y, z) => {
    if (isNaN(x) || isNaN(y) || isNaN(z)){
        SendChat(`&c引数が無効です。/${commands.loc.name} move <id> <dx(int)> <dy(int)> <dz(int)> の形式で入力して下さい。`);
        return;
    }
    if (z === undefined) {
        SendChat(`&c引数が不足しています。/${commands.loc.name} move <id> <dx> <dy> <dz> の形式で入力して下さい。`);
        return;
    }
    for (let i = 0; i < data.cmdbox[area].pos[id].length; i ++){
        data.cmdbox[area].pos[id][i].x += Number(x);
        data.cmdbox[area].pos[id][i].y += Number(y);
        data.cmdbox[area].pos[id][i].z += Number(z);
    }
    data.save();
    SendChat(`座標を移動しました: id = ${id}, X += ${x}, Y += ${y}, Z += ${z}`);
}


// 座標保存コマンド
register("command", (subcommand ,arg1, arg2, arg3, arg4) => {
    if (subcommand === undefined) {
        SendChat(
`§csubcommandが選択されていません
§f==============================
${loc_help_msg}
`
        );
    }
    if (subcommand === "append") {
        if (area === "Garden" || !area) {
            SendChat("&cこのコマンドはGarden/location読み込み前に使用できません。\nGardenで利用する場合、MiFm(/mifm)のコマンドを利用してください");
            return;
        }
        append_marker(arg2, arg3, arg4, arg1);
    }
    if (subcommand === "list") {
        list_markers();
        return;
    }
    if (subcommand === "pop") {
        pop_marker(arg2, arg3, arg4, arg1);
        return;
    }
    if (subcommand === "help") {
        SendChat(help_msg);
        return;
    }
    if (subcommand === "size") {
        ChangeSize(arg1, arg2, arg3, arg4);
        return;
    }
    if (subcommand === "move") {
        MovePlace(arg1, arg2, arg3, arg4);
        return;
    }
    SendChat(`&c引数が無効です。${commands.loc.name} <append|list|pop|help|size|move> の形式で入力してください。`); 
}).setName(commands.loc.name);



// if /swap then
const _bind_change = (id, cmd) => {
    if (cmd === undefined || cmd.length === 0) {
        SendChat(`&c引数が不足しています。${commands.bind.name} <id> <w|a|s|d> の形式で入力してください。`);
        return;
    }
    if (!cmd[0].startsWith("/") && !cmd[0].startsWith("toast")) {
        SendChat(`&c引数が無効です。${commands.bind.name} <id> </command> の形式で入力してください。`);
        return;
    }
    // idのブロックを踏んだら発火するように記憶
    if (!data.cmdbox[area].bind) data.cmdbox[area].bind = {};
    if (cmd[0].startsWith("toast")){
        cmd = cmd.join(" ");
        data.cmdbox[area].bind[id] = cmd;
    }
    else{
        cmd = cmd.join(" ");
        data.cmdbox[area].bind[id] = cmd;
    }

    data.save();

    SendChat(`bindを保存しました: id = ${id}, command = ${cmd}`);

    // keyConfigs[0].func_151462_b(Keyboard.KEY_W)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_S)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_A)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_D)
    // eval(`keyConfigs[0].func_151462_b(Keyboard.KEY_${key})`); // キーコードを変更
    // // update keybind
    // update_settings();
}

const _list_bind = () => {
    SendChat("bind一覧");
    SendChat("===============================");
    if (!data.cmdbox[area].bind) data.cmdbox[area].bind = {};
    for (let id in data.cmdbox[area].bind) {
        let key = data.cmdbox[area].bind[id];
        SendChat(`id: ${id}, command: ${key}`);
    }
}





const _pop_bind = (id) => {
    if (!data.cmdbox[area].bind) data.cmdbox[area].bind = {};
    if (data.cmdbox[area].bind[id] === undefined) {
        SendChat(`id: ${id} は登録されていません`);
        return;
    }
    delete data.cmdbox[area].bind[id];
    data.save();

    SendChat(`bindを削除しました: id = ${id}`);
}

register("command", (subcommand, arg1, ...arg2) => {
    if (subcommand === undefined) {
        SendChat(
`§csubcommandが選択されていません
==============================
${bind_help_msg}
`
        );
    }
    else if (subcommand === "help") {
        SendChat(bind_help_msg);
    }
    else if (subcommand === "list") {
        _list_bind();
    }
    else if (subcommand === "set") {
        if (area === "Garden" || !area) {
            SendChat("&cこのコマンドはGarden/location読み込み前では使用できません。\nGardenで利用する場合、MiFm(/mifm)のコマンドを利用してください");
            return;
        }
        _bind_change(arg1, arg2);
    }
    else if (subcommand === "pop") {
        _pop_bind(arg1);
    }
}).setName(commands.bind.name);


const _help = () => {
    SendChat(
        "\n" +
        loc_help_msg +
        bind_help_msg
    )
}

register("command", () => {
    _help();
}).setName(commands.help.name);

register("command", () => {
    _help();
}).setName(commands.base.name);

const _change_key_if_id = (id) => {
    if (area === "Garden") {
        // gardenコマンドはMiFmで実行
        return false;
    }
    if (!data.cmdbox[area].bind) data.cmdbox[area].bind = {};
    //data.cmdbox[area].bind[id]が存在するか
    if (data.cmdbox[area].bind[id] === undefined) {
        return false;
    }
    else if (typeof data.cmdbox[area].bind[id] === "string"
            && data.cmdbox[area].bind[id].startsWith("/")
    ){
        // キーを未使用に(未使用にするとキーバインドが分裂する)
        // keyConfigs.forEach(config => config.func_151462_b(Keyboard.KEY_NONE));
        // そのコマンドを登録
        if (runCommandKey.isPressed()) {
            if (CoolTimes.PosCommands > 0){
                SendChat(`コマンドが使用可能になるまで ${CoolTimes.PosCommands} tick待ってください。`);
                return true;
            }
            // コマンドを実行(戻り値はコマンドが実行されたかどうかっぽい)
            if (!ClientCommandHandler.instance.func_71556_a(mc.field_71439_g, `/${data.cmdbox[area].bind[id].slice(1)}`)){
                // コマンドを実行
                ChatLib.command(data.cmdbox[area].bind[id].slice(1));
            }
            CoolTimes.PosCommands = 20;
            SendChat(`コマンドを実行しました: ${data.cmdbox[area].bind[id].slice(1)}`);
        }
    }
    else if (typeof data.cmdbox[area].bind[id] === "string"
            && data.cmdbox[area].bind[id].startsWith("toast")
    ){
        if (CoolTimes.BindToast > 0){
            if (CoolTimes.BindToast % 10 === 0){
                SendChat(`トーストが使用可能になるまで ${CoolTimes.BindToast} tick待ってください。`);
            }
            return "toast";
        }
        let command = 'powershell -Command "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null;'
        + '$Template = [Windows.UI.Notifications.ToastTemplateType]::ToastText01;'
        + '$ToastXML = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($Template);'
        + '$ToastTextElements = $ToastXML.GetElementsByTagName(\'text\');'
        + '$ToastTextElements.Item(0).AppendChild($ToastXML.CreateTextNode(\''+ data.cmdbox[area].bind[id].slice(5) +'\')) | Out-Null;'
        + '$Toast = [Windows.UI.Notifications.ToastNotification]::new($ToastXML);'
        + '$Toast.ExpirationTime = [DateTimeOffset]::Now.AddSeconds(3);' // 通知を1秒表示
        + '$Notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier(\''+ 'Mifm' +'\');'
        + '$Notifier.Show($Toast)"';

        Java.type("java.lang.Runtime").getRuntime().exec(command);
        CoolTimes.BindToast = 140;
        return "toast";
    }
    else{
        SendChat(`id: ${id} のbind ${data.cmdbox[area].bind[id]}は無効です。`);
    }
    return true;
}


const isPlayerInBox = (boxPos, playerPos,size) => {
    // console.log(JSON.stringify(size));
    if (size.dx < 0) {boxPos.x += size.dx + 1; size.dx -= size.dx * 2};
    if (size.dy < 0) {boxPos.y += size.dy + 1; size.dy -= size.dy * 2};
    if (size.dz < 0) {boxPos.z += size.dz + 1; size.dz -= size.dz * 2};
    return ((boxPos.x <= playerPos.x && boxPos.y <= playerPos.y && boxPos.z <= playerPos.z) && 
            (boxPos.x + size.dx > playerPos.x && boxPos.y + size.dy > playerPos.y && boxPos.z + size.dz > playerPos.z));
}

// オーバーレイ描画イベント
register("tick", () => {
    if (area === "Garden" || !area) return;
    if (!data.cmdbox[area].pos) return;
    const playerPos = {x: (Player.getX()),y: (Player.getY()),z: (Player.getZ())};
    for (let id in data.cmdbox[area].pos) {
        element = data.cmdbox[area].pos[id];
        size = {dx: 1, dy: 1, dz: 1}
        if (id in data.cmdbox[area].idcfg){
            if ("size" in data.cmdbox[area].idcfg[id]){
                size = data.cmdbox[area].idcfg[id].size;
            }
        }
        for (let i = 0; i < element.length; i++) {
            let pos = element[i];
            if (isPlayerInBox(deepCopyObject(pos), playerPos, deepCopyObject(size))) {
                let sound_in_pos = 'note.pling'; // 音の設定
                let result = _change_key_if_id(id);
                if (result){
                    sound_in_pos = null;
                }
                try{
                    if (sound_in_pos !== null){
                        World.playSound(sound_in_pos, 2, 1);
                    }
                }catch(e){
                    SendChat(`§cFailed to play sound: ${sound_in_pos}`);
                }
            }
        }
    }
});



register("tick", () => {
    // cooltimeの全ての値を-1
    for (let key in CoolTimes){
        if (CoolTimes[key] > 0){
            CoolTimes[key]--;
        }
    }
});