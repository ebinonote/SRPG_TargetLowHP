﻿

## 概要


 - 神鏡学斗様のRPGツクールMVでSRPGを作れるようになるプラグイン
「SRPGコンバータMV」で動くプラグインです。
SRPGコンバータMV配布サイト：「Lemon slice」
<http://www.lemon-slice.net/index.html>

### ●できること
 - HPが低いアクターが狙われる
 - 狙われているアクターにヘイトリングが表示できる
 - 次の敵ターン中にやられそうなアクターにデスマークが表示できる

### ●使い方
プラグインマネージャーでSRPG_core.jsの下に配置してください。
hatering.pngとdeathmark.pngをimg/systemフォルダに入れてください。


## 仕様


 - 敵の行動範囲の中の一番HPが低い味方を狙います。
 - 範囲内に誰もいない場合、今まで通り一番近いアクターを狙います。
 - アクターターンが開始したとき、敵キャラの使うスキルが決定されます。


## ヘイトリング


ヘイトリングとは、敵に狙われていることを示す赤い輪です。  

プラグインパラメータでON・OFFの切り替えが可能です。  


## デスマーク


デスマークとは、次の敵のターン中にやられそうな味方を示すマークです。

誰かが行動終了するたびに次のターンの敵の行動を計算し、味方が受けるダメージを計算します。ダメージが現在のHPを超えていた場合、その味方にデスマークが出現します。

しかし、デスマークが出ていなくてもやられることがあります。
例：

 - HPの減少で敵の狙いが変わった時
 - 敵のターン中に防御力が下がるなどしてダメージが変動したとき
 - srpgPredictionDamageでダメージを予測できないスキル（2回攻撃など）

プラグインパラメータ・プラグインコマンドでON・OFFの切り替えが可能です。


## プラグインコマンド


ShowDeathMark  
  デスマークを表示します。  
HideDeathMark  
  デスマークを非表示にします。  


## 更新履歴


### Version 1.02
  エネミーがＭＰ/ＴＰが足りない場合でもスキルを使用してしまい、ＭＰ/ＴＰが
  マイナスになる不具合を修正しました。

### Version 1.01
  最新のＳＲＰＧコンバータＭＶで2ターン目以降敵のターンが来なくなっていた問
  題を修正しました。

### Version 1.00
  プラグイン公開


## 利用規約


 - MITライセンスです。つまり↓↓
 - クレジット表記は不要
 - 営利目的で使用可
 - 改変可
	 - ただし、ソースコードのヘッダのライセンス表示は削除しないでください。
 - 素材だけの再配布も可
 - アダルトゲーム、残酷なゲームでの使用も可

## License

MIT


