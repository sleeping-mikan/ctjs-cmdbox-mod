# MiFarming Mod

## How to Use

> [!note]
> このmodの導入にはChatTriggersの導入とmiの導入が必要です。

(起動構成のパス)\config\ChatTriggers\modulesに[release](https://github.com/sleeping-mikan/ctjs-mi-mod/releases/)のmodules.zipを解凍し、中身を全て配置してください

> [!note]
> このパスはゲーム内で/ct filesを実行することで開けることができます。

## Use it

|コマンド|実行結果|
|----|----|
|micmd|helpを表示します|
|micmd-help|helpを表示します|
|micmd-loc append [id] [X(optional)] [Y(optional)] [Z(optional)]|現在エリアに登録座標を追加します。座標を選択しない場合は現在の座標を追加します。|
|micmd-loc pop [id(optional)] [X(optional)] [Y(optional)] [Z(optional)]|現在エリアの登録座標を削除します。何も指定しない場合現在座標を、idのみを指定する場合そのidを持つ座標全てを対象に取ります。|
|micmd-loc list|現在エリアの登録座標を全て表示します|
|micmd-loc size [id] [dx] [dy] [dz]|現在エリアのidに該当する座標のboxサイズをdx,dy,dzに変更します。|
|micmd-bind set [id] [command]|現在エリアの特定のidを踏んだ時、/から始まるコマンドをDに割り当てます。|
|micmd-bind set [id] toast [str]|現在エリアの特定のidを踏んだ時、strをwindowsのtoastに表示します。(windowsのみ)|
|micmd-bind pop [id]|現在エリアの特定のidのキー割り当て情報を削除します。|
|micmd-bind list|現在エリアの現在のキー割り当て情報を表示します。|

|キー|実行結果|
|----|----|
|N|現在座標にboxが存在する場合、boxに設定されたコマンドを実行します。|