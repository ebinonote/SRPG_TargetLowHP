// =============================================================================
// SRPG_TargetLowHP.js
// Version: 1.00
// -----------------------------------------------------------------------------
// Copyright (c) 2018 ヱビ
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
// -----------------------------------------------------------------------------
// [Homepage]: ヱビのノート
//             http://www.zf.em-net.ne.jp/~ebi-games/
// =============================================================================


/*:
 * @plugindesc v1.00 SRPGコンバータMVで、HPが低いアクターが狙われます。また、ヘイトリングとデスマークを表示できます。
 * @author ヱビ
 * 
 * @requiredAssets img/system/hatering
 * @requiredAssets img/system/deathmark
 *
 * @param dispHateRing
 * @type boolean
 * @on 表示
 * @off 非表示
 * @desc ヘイトリングを表示しますか？
 * @default false
 * 
 * 
 * @param dispDeathMark
 * @type boolean
 * @on 表示
 * @off 非表示
 * @desc デスマークを表示しますか？
 * @default false
 *
 * @help
 * ============================================================================
 * 概要
 * ============================================================================
 * 
 * ・神鏡学斗様のRPGツクールでSRPGを作れるようになるプラグイン
 * 「SRPGコンバータMV」で動くプラグインです。
 * SRPGコンバータMV配布サイト：「Lemon slice」
 * http://www.lemon-slice.net/index.html
 * 
 * ●できること
 * ・HPが低いアクターが狙われる
 * ・狙われているアクターにヘイトリングが表示できる
 * ・次の敵ターン中にやられそうなアクターにデスマークが表示できる
 * 
 * ●使い方
 * プラグインマネージャーでSRPG_core.jsの下に配置してください。
 * hatering.pngとdeathmark.pngをimg/systemフォルダに入れてください。
 * 
 * ============================================================================
 * 仕様
 * ============================================================================
 * 
 * ・敵の行動範囲の中の一番HPが低い味方を狙います。
 * ・範囲内に誰もいない場合、今まで通り一番近いアクターを狙います。
 * ・アクターターンが開始したとき、敵キャラの使うスキルが決定されます。
 * 
 * ============================================================================
 * ヘイトリング
 * ============================================================================
 * 
 * ヘイトリングとは、敵に狙われていることを示す赤い輪です。
 * プラグインパラメータでON・OFFの切り替えが可能です。
 * 
 * ============================================================================
 * デスマーク
 * ============================================================================
 * 
 * デスマークとは、次の敵のターン中にやられそうな味方を示すマークです。
 * 
 * 誰かが行動終了するたびに次のターンの敵の行動を計算し、味方が受けるダメージを
 * 計算します。ダメージが現在のHPを超えていた場合、その味方にデスマークが出現し
 * ます。
 * 
 * しかし、デスマークが出ていなくてもやられることがあります。
 * 例：
 * ・HPの減少で敵の狙いが変わった時
 * ・敵のターン中に防御力が下がるなどしてダメージが変動したとき
 * ・srpgPredictionDamageでダメージを予測できないスキル（2回攻撃など）
 * 
 * プラグインパラメータ・プラグインコマンドでON・OFFの切り替えが可能です。
 * 
 * ============================================================================
 * プラグインコマンド
 * ============================================================================
 * 
 * ShowDeathMark
 *   デスマークを表示します。
 * HideDeathMark
 *   デスマークを非表示にします。
 * 
 * ============================================================================
 * 更新履歴
 * ============================================================================
 * 
 * Version 1.00
 *   プラグイン公開
 * 
 * ============================================================================
 * 利用規約
 * ============================================================================
 * 
 * ・MITライセンスです。つまり↓↓
 * ・クレジット表記は不要
 * ・営利目的で使用可
 * ・改変可
 *     ただし、ソースコードのヘッダのライセンス表示は削除しないでください。
 * ・素材だけの再配布も可
 * ・アダルトゲーム、残酷なゲームでの使用も可
 * 
 * 
 */

(function() {
	var parameters = PluginManager.parameters('SRPG_TargetLowHP');
	var dispHateRing = eval(parameters["dispHateRing"]);
	var dispDeathMark = eval(parameters["dispDeathMark"]);

//=============================================================================
// Game_Interpreter
//=============================================================================

    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ShowDeathMark') {
            $gameSystem.setDispDeathMark(true);
        } else if (command === 'HideDeathMark') {
			$gameSystem.setDispDeathMark(false);
		}
    };

	var _Game_Interpreter_prototype_addEnemy = Game_Interpreter.prototype.addEnemy;
	Game_Interpreter.prototype.addEnemy = function(eventId, enemyId) {
		var r = _Game_Interpreter_prototype_addEnemy.call(this, eventId, enemyId);
		// シーンマネージャーから現在のシーンをとっているので
		// 戦闘シーンだった場合アウト
		SceneManager._scene.decideNextTurnAction();
		return r;
	};

//=============================================================================
// Game_System
//=============================================================================

	var _Game_System_prototype_srpgStartActorTurn = Game_System.prototype.srpgStartActorTurn;
	Game_System.prototype.srpgStartActorTurn = function() {
		_Game_System_prototype_srpgStartActorTurn.call(this);
		// シーンマネージャーから現在のシーンをとっているので
		// 戦闘シーンだった場合アウト
		SceneManager._scene.decideNextTurnAction();
	}

	Game_System.prototype.isDispHateRing = function() {
		return dispHateRing;
	};

	Game_System.prototype.initDispDeathMark = function() {
		this._dispDeathMark = dispDeathMark;
	};

	Game_System.prototype.setDispDeathMark = function(value) {
		this._dispDeathMark = value;
	};

	Game_System.prototype.isDispDeathMark = function() {
		if (this._dispDeathMark === undefined) this.initDispDeathMark();
		return this._dispDeathMark;
	};

    Game_System.prototype.srpgMakeMoveListTemp = function(event) {
        var battlerArray = $gameSystem.EventToUnit(event.eventId());
        $gameTemp.clearMoveTableTemp();
        $gameTemp.initialMoveTableTemp(event.posX(), event.posY(), battlerArray[1].srpgMove());
        event.makeMoveTableTemp(event.posX(), event.posY(), battlerArray[1].srpgMove(), [0], battlerArray[1].srpgThroughTag());
        var list = $gameTemp.moveListTemp();
        for (var i = 0; i < list.length; i++) {
            var pos = list[i];
            if (battlerArray[1].action(0) && battlerArray[1].action(0).item()) {
                event.makeRangeTableTemp(pos[0], pos[1], battlerArray[1].srpgSkillRange(battlerArray[1].action(0).item()), [0]);
            } else {
                event.makeRangeTableTemp(pos[0], pos[1], battlerArray[1].srpgWeaponRange(), [0]);
            }
        }
        $gameTemp.pushRangeListToMoveListTemp();
    };

//=============================================================================
// Game_Temp
//=============================================================================

	/* ~Temp:SRPG_core.jsからコピペしてきて後ろにTempを付けただけの関数シリーズ。
	 * 次の敵キャラの行動を計算するのに必要だった。
	 */

    //初期化処理
    var _SRPG_Game_Temp_initialize = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
    _SRPG_Game_Temp_initialize.call(this);
    this._MoveTableTemp = [];
    this._MoveListTemp = [];
    this._RangeTableTemp = [];
    this._RangeListTemp = [];
    this._ResetMoveListTemp = false;
    this._SrpgDistanceTemp = 0;
    this._ActiveEventTemp = null;
    this._TargetEventTemp = null;
    this._OriginalPosTemp = [];
    this._SrpgEventListTemp = [];
    };

    //移動範囲と移動経路を記録する配列変数を返す
    Game_Temp.prototype.MoveTableTemp = function(x, y) {
        return this._MoveTableTemp[x][y];
    };

    //移動範囲を設定する
    Game_Temp.prototype.setMoveTableTemp = function(x, y, move, route) {
        this._MoveTableTemp[x][y] = [move, route];
    };

    //攻撃射程と計算経路を記録する配列変数を返す
    Game_Temp.prototype.RangeTableTemp = function(x, y) {
        return this._RangeTableTemp[x][y];
    };

    //攻撃射程を設定する
    Game_Temp.prototype.setRangeTableTemp = function(x, y, move, route) {
        this._RangeTableTemp[x][y] = [move, route];
    };

    //移動可能な座標のリストを返す(移動範囲表示で使用)
    Game_Temp.prototype.moveListTemp = function() {
        return this._MoveListTemp;
    };

    //移動可能な座標のリストに追加する
    Game_Temp.prototype.pushMoveListTemp = function(xy) {
        this._MoveListTemp.push(xy);
    };

    //座標リストにデータが入っているか返す
    Game_Temp.prototype.isMoveListValidTemp = function() {
        return this._MoveListTemp.length > 0;
    };

    //攻撃可能な座標のリストを返す(攻撃射程表示で使用)
    Game_Temp.prototype.rangeListTemp = function() {
        return this._RangeListTemp;
    };

    //攻撃可能な座標のリストに追加する
    Game_Temp.prototype.pushRangeListTemp = function(xy) {
        this._RangeListTemp.push(xy);
    };

    //移動範囲の配列に射程範囲の配列を結合する
    Game_Temp.prototype.pushRangeListToMoveListTemp = function(array) {
        Array.prototype.push.apply(this._MoveListTemp, this._RangeListTemp);
    };

    //射程範囲から最低射程を除く
    Game_Temp.prototype.minRangeAdaptTemp = function(oriX, oriY, minRange) {
        var newList = [];
        for (var i = 0; i < this._RangeListTemp.length; i++) {
            var x = this._RangeListTemp[i][0];
            var y = this._RangeListTemp[i][1];
            var dis = Math.abs(x - oriX) + Math.abs(y - oriY);
            if (dis >= minRange) {
                newList.push(this._RangeListTemp[i]);
            }
        }
        this._RangeListTemp = [];
        this._RangeListTemp = newList;
    };

    //移動範囲を初期化する
    Game_Temp.prototype.clearMoveTableTemp = function() {
        this._MoveTableTemp = [];
        this._MoveListTemp = [];
        for (var i = 0; i < $dataMap.width; i++) {
          var vartical = [];
          for (var j = 0; j < $dataMap.height; j++) {
            vartical[j] = [-1, []];
          }
          this._MoveTableTemp[i] = vartical;
        }
        this._RangeTableTemp = [];
        this._RangeListTemp = [];
        for (var i = 0; i < $dataMap.width; i++) {
          var vartical = [];
          for (var j = 0; j < $dataMap.height; j++) {
            vartical[j] = [-1, []];
          }
          this._RangeTableTemp[i] = vartical;
        }
    };

    //移動範囲のスプライト消去のフラグを返す
    Game_Temp.prototype.resetMoveListTemp = function() {
        return this._ResetMoveListTemp;
    };

    //移動範囲のスプライト消去のフラグを設定する
    Game_Temp.prototype.setResetMoveListTemp = function(flag) {
        this._ResetMoveListTemp = flag;
    };

    //自身の直下は常に歩けるようにする
    Game_Temp.prototype.initialMoveTableTemp = function(oriX, oriY, oriMove) {
        this.setMoveTableTemp(oriX, oriY, oriMove, [0]);
        this.pushMoveListTemp([oriX, oriY, false]);
    }

    //自身の直下は常に攻撃射程に含める
    Game_Temp.prototype.initialRangeTableTemp = function(oriX, oriY, oriMove) {
        this.setRangeTableTemp(oriX, oriY, oriMove, [0]);
        this.pushRangeListTemp([oriX, oriY, true]);
    }

    //攻撃ユニットと対象の距離を返す
    Game_Temp.prototype.SrpgDistanceTemp = function() {
        return this._SrpgDistanceTemp;
    };

    //攻撃ユニットと対象の距離を設定する
    Game_Temp.prototype.setSrpgDistanceTemp = function(val) {
        this._SrpgDistanceTemp = val;
    };

    //アクティブイベントの設定
    Game_Temp.prototype.activeEventTemp = function() {
        return this._ActiveEventTemp;
    };

    Game_Temp.prototype.setActiveEventTemp = function(event) {
        this._ActiveEventTemp = event;
        //$gameVariables.setValue(_activeEventID, event.eventId());
    };

    Game_Temp.prototype.clearActiveEventTemp = function() {
        this._ActiveEventTemp = null;
        //$gameVariables.setValue(_activeEventID, 0);
    };

    //行動対象となるユニットの設定
    Game_Temp.prototype.targetEventTemp = function() {
        return this._TargetEventTemp;
    };

    Game_Temp.prototype.setTargetEventTemp = function(event) {
        this._TargetEventTemp = event;
        if (this._TargetEventTemp) {
            //$gameVariables.setValue(_targetEventID, event.eventId());
        }
    };

    Game_Temp.prototype.clearTargetEventTemp = function() {
        this._TargetEventTemp = null;
        //$gameVariables.setValue(_targetEventID, 0);
    };

    //アクティブイベントの座標を返す
    Game_Temp.prototype.originalPosTemp = function() {
        return this._OriginalPosTemp;
    };

    //アクティブイベントの座標を記録する
    Game_Temp.prototype.reserveOriginalPosTemp = function(x, y) {
        this._OriginalPosTemp = [x, y];
    };

//=============================================================================
// Game_Enemy
//=============================================================================

	var _Game_Enemy_prototype_initMembers = Game_Enemy.prototype.initMembers;
	Game_Enemy.prototype.initMembers = function() {
		_Game_Enemy_prototype_initMembers.call(this);
		this._hasDecidedAction = false;
		this.nextAction = null;
	};

	
	Game_Enemy.prototype.hasDecidedAction = function() {
		return this._hasDecidedAction;
	};

	
	var _Game_Enemy_prototype_makeSrpgActions = Game_Enemy.prototype.makeSrpgActions;
	Game_Enemy.prototype.makeSrpgActions = function() {
		_Game_Enemy_prototype_makeSrpgActions.call(this);
		if (this.action(0)) {
			this.nextAction = this.action(0);
		}
		this._hasDecidedAction = true;
	}

	var _Game_Enemy_prototype_onTurnEnd = Game_Enemy.prototype.onTurnEnd;
	Game_Enemy.prototype.onTurnEnd = function() {
		this._hasDecidedAction = false;
		_Game_Enemy_prototype_onTurnEnd.call(this);
	}

	Game_Enemy.prototype.hateTargetOf = function(group) {
		var min = 99999999;
		var mainTarget;
		group.forEach(function(member) {
			if (!member.isActor()) return false;
			// if (!member.isBattleMember()) return false;
			var i = member.actorId();
			if (min > member.hp) {
				min = member.hp;
				mainTarget = member;
			}
		});
		return mainTarget;
	}

	Game_Enemy.prototype.setABTargetEvent = function(targetEvent) {
		if (!targetEvent || $gameSystem.EventToUnit(targetEvent.eventId())[0] === "enemy") {
			this.ABTargetEvent = null;
			return;
		}
		this.ABTargetEvent = targetEvent;
	};

	Game_Enemy.prototype.ABTargetX = function() {
		if (!this.ABTargetEvent) return -9999;
		return this.ABTargetEvent._realX;
	};

	Game_Enemy.prototype.ABTargetY = function() {
		if (!this.ABTargetEvent) return -9999;
		return this.ABTargetEvent._realY;
	};


//=============================================================================
// Scene_Map
//=============================================================================

	var _Scene_Map_prototyp_srpgDecideTarget = Scene_Map.prototype.srpgDecideTarget;
     //ターゲットの決定
    Scene_Map.prototype.srpgDecideTarget = function(canAttackTargets, activeEvent, targetType) {
		// 行動者がアクター、もしくはターゲットがエネミーの場合
		if ($gameSystem.EventToUnit(activeEvent._eventId)[0] == "actor" || targetType == "enemy") {
			return _Scene_Map_prototyp_srpgDecideTarget.call(this, canAttackTargets, activeEvent, targetType);
		}
		// エネミーの場合
		var enemy = $gameSystem.EventToUnit(activeEvent._eventId)[1];
        var targetEvent = null;
        // 攻撃対象としうる相手がいない場合　最短距離にいる相手を設定する

        if (canAttackTargets.length === 0) {
            var minDis = 9999;
            var events = $gameMap.events();
            for (var i = 0; i <  events.length; i++) {
                var event = events[i];
                var dis = $gameSystem.unitDistance(activeEvent, event);
                if (event.isType() === targetType && !event.isErased() && dis < minDis &&
                    //$gameTemp.activeEvent() != event) {
					activeEvent != event) {
                    minDis = dis;
                    targetEvent = event;
                }
            }
            return targetEvent;
        }

        // 攻撃対象としうる相手がいる場合
		// SRPG_core.jsからの変更箇所
/*
        var sum = canAttackTargets.reduce(function(r, event) {
            var battler = $gameSystem.EventToUnit(event.eventId())[1];
            return r + battler.tgr;
        }, 0);
        var tgrRand = Math.random() * sum;
        canAttackTargets.forEach(function(event) {
            var battler = $gameSystem.EventToUnit(event.eventId())[1];
            tgrRand -= battler.tgr;
            if (tgrRand <= 0 && !targetEvent) {
                targetEvent = event;
            }
        });
*/
		var canAttackActors = [];
		canAttackTargets.forEach(function(event){
			var actor = $gameSystem.EventToUnit(event._eventId)[1];
			canAttackActors.push(actor);
		});
		var eventId = $gameSystem.ActorToEvent(enemy.hateTargetOf(canAttackActors).actorId());
		targetEvent = $gameMap.event(eventId);
        return targetEvent;

    };

	/*
	Scene_Map.prototype.srpgInvokeEnemyMoveは、
	

	*/

	// 上書き
    //エネミーの行動決定
    Scene_Map.prototype.srpgInvokeEnemyCommand = function() {
        var id = $gameSystem.isAutoUnitId();
        if (id > $gameMap.isMaxEventId()) {
            $gameSystem.srpgTurnEnd(); // ターンを終了する
            return;
        }
        $gameSystem.setAutoUnitId(id + 1);
        var event = $gameMap.event(id);
        if (event && event.isType() === 'enemy') {
            var enemy = $gameSystem.EventToUnit(event.eventId())[1];
            if (enemy.canMove() == true && !enemy.srpgTurnEnd()) {
                if (!enemy.hasDecidedAction()) enemy.makeSrpgActions();
                if (enemy.nextAction.item()) {
					enemy.setAction(0, enemy.nextAction);
                    $gameTemp.setAutoMoveDestinationValid(true);
                    $gameTemp.setAutoMoveDestination(event.posX(), event.posY());
                    $gameTemp.setActiveEvent(event);
                    $gameSystem.setSubBattlePhase('enemy_move');
                } else {
                    $gameTemp.setActiveEvent(event);
                    enemy.onAllActionsEnd();
                    this.srpgAfterAction();
                }
            }
        }
    };

	// 敵から敵にスキルを使ったとき、
	// enemy.actionもリセットされていると考えられる。

	Scene_Map.prototype.decideNextTurnAction = function() {
		$gameParty.clearNextTurnDamage();
		var autoId = $gameSystem.isAutoUnitId();
		for (var id = 0; id <= $gameMap.isMaxEventId(); id++) {
			var event = $gameMap.event(id);
			if (event && event.isType() === 'enemy') {
				$gameTemp.setActiveEventTemp(event);
				var enemy = $gameSystem.EventToUnit(event.eventId())[1];
				enemy.setABTargetEvent(null);
				if (enemy.isAlive()) {
					if (!enemy.hasDecidedAction()) {
						enemy.makeSrpgActions();
					}
					if (enemy.nextAction.item()) {
						enemy.setAction(0, enemy.nextAction);
						enemy.action(0).setSrpgEnemySubject(0);
						enemy.action(0).setSubjectDir(enemy);
						var type = "enemy";
						var targetType = this.makeTargetType(enemy, type);
						var canAttackTargets = this.srpgMakeCanAttackTargetsTemp(event, enemy, targetType);//行動対象としうるユニットのリストを作成
					
						if (canAttackTargets.length === 0 || ($gameSystem.isBattlePhase() == "enemy_phase" && id < autoId)) {
							continue;
						}
						var targetEvent = this.srpgDecideTarget(canAttackTargets, event, targetType);
						var targetBattlerArray = $gameSystem.EventToUnit(targetEvent.eventId());
						if (targetBattlerArray[0] == "actor") {
							var damage = enemy.action(0).srpgPredictionDamage(targetBattlerArray[1]);
							targetBattlerArray[1].addNextTurnDamage(damage);
						}
						
						enemy.setABTargetEvent(targetEvent);
					}
				}
			}
		}
/*
		this.makeSrpgActions();
		
		var type = "enemy";
		var targetType = this.makeTargetType(this, type);
		var canAttackTargets = this.srpgMakeCanAttackTargets(this, targetType); //行動対象としうるユニットのリストを作成
		if (!canAttackTargets) return;
		var targetEvent = this.srpgDecideTarget(canAttackTargets, , targetType);
		var targetBattlerArray = $gameSystem.EventToUnit(targetEvent.eventId());
		if (targetBattlerArray[0] == "actor") {
			var damage = this.currentAction().srpgPredictionDamage(targetBattlerArray[1]);
			targetBattlerArray[1].addNextTurnDamage(damage);
			this.setABTargetEvent(targetEvent);
			
		}
*/
	};

    // 移動力と射程を足した範囲内にいる対象をリストアップする
    Scene_Map.prototype.srpgMakeCanAttackTargetsTemp = function(activeEvent, battler, targetType) {
        $gameSystem.srpgMakeMoveListTemp(activeEvent);
		var moveRangeList = $gameTemp.moveListTemp();
        var targetList = [];
        for (var i = 0; i < moveRangeList.length; i++) {
            var pos =  moveRangeList[i];
            var events = $gameMap.eventsXyNt(pos[0], pos[1]);
            for (var j = 0; j < events.length; j++) {
                var event = events[j];
                if (event.isType() === targetType && !event.isErased() &&
                    targetList.indexOf(event) === -1) {
                    if (!battler.isConfused() || activeEvent != event) {
                        targetList.push(event);
                    }
                }
            }
        }
        return targetList;
    };
	var _Scene_Map_prototype_srpgAfterAction = Scene_Map.prototype.srpgAfterAction;
	Scene_Map.prototype.srpgAfterAction = function() {
		_Scene_Map_prototype_srpgAfterAction.call(this);
		this.decideNextTurnAction();
	};
	
//=============================================================================
// Game_BattlerBase
//=============================================================================
/*
	var _Game_BattlerBase_prototype_isOccasionOk = Game_BattlerBase.prototype.isOccasionOk;
	Game_BattlerBase.prototype.isOccasionOk = function(item) {
		if (this.isEnemy()) return true;
		return _Game_BattlerBase_prototype_isOccasionOk.call(this, item);
	}
*/

//


	var _Game_BattlerBase_prototype_canUse = Game_BattlerBase.prototype.canUse;
	Game_BattlerBase.prototype.canUse = function(item) {
		// エネミー増援したとき、スキルを予測するためにアクターフェイズでも
		// スキルを使用可能であることにする
		if (!item) return false;
		if ($gameSystem.isSRPGMode() && this.isEnemy() && 
			!(this.srpgSkillRange(item) < $gameTemp.SrpgDistance() ||
                this.srpgSkillMinRange(item) > $gameTemp.SrpgDistance())) {
			return true;
		}
		return _Game_BattlerBase_prototype_canUse.call(this, item);
	};

//=============================================================================
// Game_CharacterBase
//=============================================================================

    //対立陣営であれば通り抜けられない（移動範囲演算用） オブジェクトも一緒に処理する
    Game_CharacterBase.prototype.isSrpgCollidedWithEventsTemp = function(x, y) {
        var events = $gameMap.eventsXyNt(x, y);
        return events.some(function(event) {
            if ((event.isType() === 'actor' && $gameTemp.activeEventTemp().isType() === 'enemy') ||
                (event.isType() === 'enemy' && $gameTemp.activeEventTemp().isType() === 'actor') ||
                (event.isType() === 'object' && event.characterName() != '') && !event.isErased()) {
                return true;
            } else {
                return false;
            }
        });
    };
    //移動可能かを判定する（移動範囲演算用）
    Game_CharacterBase.prototype.srpgMoveCanPassTemp = function(x, y, d, tag) {
        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        if (!$gameMap.isValid(x2, y2)) {
            return false;
        }
        if (this.isSrpgCollidedWithEventsTemp(x2, y2)) {
            return false;
        }
        if (this.isThrough()) {
            return true;
        }
        if (($gameMap.terrainTag(x2, y2) > 0 && $gameMap.terrainTag(x2, y2) <= tag) ||
            ($gameMap.terrainTag(x, y) > 0 && $gameMap.terrainTag(x, y) <= tag &&
             $gameMap.isPassable(x2, y2, this.reverseDir(d)))) {
            return true;
        }
        if (!this.isMapPassable(x, y, d)) {
            return false;
        }
        return true;
    };

    Game_CharacterBase.prototype.makeMoveTableTemp = function(x, y, move, route, tag) {
        if (move <= 0) {
            return;
        }
        //上方向を探索
        if (route[route.length - 1] != 2) {
            if (this.srpgMoveCanPassTemp(x, y, 8, tag)) {
                if ($gameTemp.MoveTableTemp(x, y - 1)[0] < move - 1) {
                    if ($gameTemp.MoveTableTemp(x, y - 1)[0] < 0) {
                        $gameTemp.pushMoveListTemp([x, y - 1, false]);
                    }
                    $gameTemp.setMoveTableTemp(x, y - 1, move - 1, route.concat(8));
                    this.makeMoveTableTemp(x, y - 1, move - 1, route.concat(8), tag);
                }
            }
        }
        //右方向を探索
        if (route[route.length - 1] != 4) {
            if (this.srpgMoveCanPassTemp(x, y, 6, tag)) {
                if ($gameTemp.MoveTableTemp(x + 1, y)[0] < move - 1) {
                    if ($gameTemp.MoveTableTemp(x + 1, y)[0] < 0) {
                        $gameTemp.pushMoveListTemp([x + 1, y, false]);
                    }
                    $gameTemp.setMoveTableTemp(x + 1, y, move - 1, route.concat(6));
                    this.makeMoveTableTemp(x + 1, y, move - 1, route.concat(6), tag);
                }
            }
        }
        //左方向を探索
        if (route[route.length - 1] != 6) {
            if (this.srpgMoveCanPassTemp(x, y, 4, tag)) {
                if ($gameTemp.MoveTableTemp(x - 1, y)[0] < move - 1) {
                    if ($gameTemp.MoveTableTemp(x - 1, y)[0] < 0) {
                        $gameTemp.pushMoveListTemp([x - 1, y, false]);
                    }
                    $gameTemp.setMoveTableTemp(x - 1, y, move - 1, route.concat(4));
                    this.makeMoveTableTemp(x - 1, y, move - 1, route.concat(4), tag);
                }
            }
        }
        //下方向を探索
        if (route[route.length - 1] != 8) {
            if (this.srpgMoveCanPassTemp(x, y, 2, tag)) {
                if ($gameTemp.MoveTableTemp(x, y + 1)[0] < move - 1) {
                    if ($gameTemp.MoveTableTemp(x, y + 1)[0] < 0) {
                        $gameTemp.pushMoveListTemp([x, y + 1, false]);
                    }
                    $gameTemp.setMoveTableTemp(x, y + 1, move - 1, route.concat(2));
                    this.makeMoveTableTemp(x, y + 1, move - 1, route.concat(2), tag);
                }
            }
        }
    };
    //攻撃射程の計算
    Game_CharacterBase.prototype.makeRangeTableTemp = function(x, y, range, route) {
        if (range <= 0) {
            return;
        }
        //上方向を探索
        if (route[route.length - 1] != 2) {
            if (this.srpgRangeCanPass(x, y, 8)) {
                if ($gameTemp.RangeTableTemp(x, y - 1)[0] < range - 1) {
                    if ($gameTemp.MoveTableTemp(x, y - 1)[0] < 0 && $gameTemp.RangeTableTemp(x, y - 1)[0] < 0) {
                        $gameTemp.pushRangeListTemp([x, y - 1, true]);
                    }
                    $gameTemp.setRangeTableTemp(x, y - 1, range - 1, route.concat(8));
                    this.makeRangeTableTemp(x, y - 1, range - 1, route.concat(8));
                }
            }
        }
        //右方向を探索
        if (route[route.length - 1] != 4) {
            if (this.srpgRangeCanPass(x, y, 6)) {
                if ($gameTemp.RangeTableTemp(x + 1, y)[0] < range - 1) {
                    if ($gameTemp.MoveTableTemp(x + 1, y)[0] < 0 && $gameTemp.RangeTableTemp(x + 1, y)[0] < 0) {
                        $gameTemp.pushRangeListTemp([x + 1, y, true]);
                    }
                    $gameTemp.setRangeTableTemp(x + 1, y, range - 1, route.concat(6));
                    this.makeRangeTableTemp(x + 1, y, range - 1, route.concat(6));
                }
            }
        }
        //左方向を探索
        if (route[route.length - 1] != 6) {
            if (this.srpgRangeCanPass(x, y, 4)) {
                if ($gameTemp.RangeTableTemp(x - 1, y)[0] < range - 1) {
                    if ($gameTemp.MoveTableTemp(x - 1, y)[0] < 0 && $gameTemp.RangeTableTemp(x - 1, y)[0] < 0) {
                        $gameTemp.pushRangeListTemp([x - 1, y, true]);
                    }
                    $gameTemp.setRangeTableTemp(x - 1, y, range - 1, route.concat(4));
                    this.makeRangeTableTemp(x - 1, y, range - 1, route.concat(4));
                }
            }
        }
        //下方向を探索
        if (route[route.length - 1] != 8) {
            if (this.srpgRangeCanPass(x, y, 2)) {
                if ($gameTemp.RangeTableTemp(x, y + 1)[0] < range - 1) {
                    if ($gameTemp.MoveTableTemp(x, y + 1)[0] < 0 && $gameTemp.RangeTableTemp(x, y + 1)[0] < 0) {
                        $gameTemp.pushRangeListTemp([x, y + 1, true]);
                    }
                    $gameTemp.setRangeTableTemp(x, y + 1, range - 1, route.concat(2));
                    this.makeRangeTableTemp(x, y + 1, range - 1, route.concat(2));
                }
            }
        }
    };

//=============================================================================
// Game_Actor
//=============================================================================

	Game_Actor.prototype.addNextTurnDamage = function(damage) {
		this._nextTurnDamage += damage;
	};

	Game_Actor.prototype.hasDeathMark = function() {
		if (!this._nextTurnDamage) return false;
		return this._nextTurnDamage >= this.hp;
	};

	Game_Actor.prototype.clearNextTurnDamage = function() {
		this._nextTurnDamage = 0;
	};
/*
	var _Game_Actor_prototype_onAllActionsEnd = Game_Actor.prototype.onAllActionsEnd;
	Game_Actor.prototype.onAllActionsEnd = function() {
		_Game_Actor_prototype_onAllActionsEnd.call(this);
		$gameParty.clearNextTurnDamage();
		$gameTroop.decideNextTurnAction();
	};
*/
//=============================================================================
// Game_Party
//=============================================================================

	Game_Party.prototype.clearNextTurnDamage = function() {
		this.allMembers().forEach(function(actor){
			actor.clearNextTurnDamage();
		});
	};


//=============================================================================
// Game_Action
//=============================================================================

	Game_Action.prototype.subject = function() {
	    if (this._subjectActorId > 0) {
	        return $gameActors.actor(this._subjectActorId);
	    } else {
			if ($gameSystem.isSRPGMode() && $gameTroop._srpgBattleEnemys.length === 0) {
				return this._subject;
			} else {
		        return $gameTroop.members()[this._subjectEnemyIndex];
			}
	    }
	};

	Game_Action.prototype.setSubjectDir = function(subject) {
	    this._subject = subject;
	};

//=============================================================================
// Game_Troop
//=============================================================================
/*
	Game_Troop.prototype.decideNextTurnAction = function() {
		this.SrpgBattleEnemys().forEach(function(enemy){
			enemy.decideNextTurnAction();
		});
	};
*/
//=============================================================================
// BattleManager
//=============================================================================
/*
	var _SRPG_BattleManager_endTurn = BattleManager.endTurn;
	BattleManager.endTurn = function() {
		_SRPG_BattleManager_endTurn.call(this);
		if ($gameSystem.isSRPGMode()) $gameTroop.decideNextTurnAction();
	};
*/
//=============================================================================
// Sprite_Character
//=============================================================================	

	var _SRPG_Sprite_Character_setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
	Sprite_Character.prototype.setCharacterBitmap = function() {
		_SRPG_Sprite_Character_setCharacterBitmap.call(this);
		// this.hateRingBitmap = ImageManager.loadSystem("hatering");
		this.deathMarkBitmap = ImageManager.loadSystem("deathmark");
	};
	var _SRPG_Sprite_Character_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
	Sprite_Character.prototype.updateCharacterFrame = function() {
		_SRPG_Sprite_Character_updateCharacterFrame.call(this);
		if ($gameSystem.isSRPGMode() == true && this._character.isEvent() == true) {
			var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
			if (battlerArray) {
				if (battlerArray[0] === 'actor' && battlerArray[1].isAlive() && 
					battlerArray[1].hasDeathMark() && $gameSystem.isDispDeathMark()) {
					this.createDeathMark();
					this._deathMark.visible = true;
					this._deathMark.opacity = (this._deathMark.opacity + 5) % 255;
				} else if (battlerArray[0] === 'actor' && this._deathMark) {
					this._deathMark.visible = false;
				} else if (battlerArray[0] === 'enemy') {
					this.createHateLine();
				}
			}
		}
	};

    Sprite_Character.prototype.createDeathMark = function() {
        if (!this._deathMark && $gameSystem.isDispDeathMark()) {
            this._deathMark = new Sprite();
			this._deathMark.bitmap = this.deathMarkBitmap;
            this._deathMark.anchor.x = 0.5;
            this._deathMark.anchor.y = 1;
            this.addChild(this._deathMark);
        }
    };
    Sprite_Character.prototype.createHateLine = function() {
        if (!this._hateLine && $gameSystem.isDispHateRing()) {
            this._hateLine = new SRPG_HateLine(this._character);
            this.addChild(this._hateLine);
        }
    };


//=============================================================================
// SRPG_HateLine
//=============================================================================
	SRPG_HateLine = function() {
		this.initialize.apply(this, arguments);
	}

	SRPG_HateLine.prototype = Object.create(Sprite_Base.prototype);
	SRPG_HateLine.prototype.constructer = SRPG_HateLine;

	SRPG_HateLine.prototype.initialize = function(enemyEvent) {
		Sprite_Base.prototype.initialize.call(this);
		var enemy = $gameSystem.EventToUnit(enemyEvent.eventId())[1];
		this._enemy = enemy;
		this._enemyEvent = enemyEvent;
		this._actorNo = -1;
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.bitmap = ImageManager.loadSystem("hatering");
		this.z = 0;
	};

	SRPG_HateLine.prototype.update = function() {
		Sprite_Base.prototype.update.call(this);
		var ex = this._enemyEvent._realX;
		var ey = this._enemyEvent._realY;
		var tx = this._enemy.ABTargetX();
		var ty = this._enemy.ABTargetY();
		this.x = (tx - ex) * 48;
		this.y = (ty - ey) * 48 - 24;
		this.rotation = -Math.atan2((ex - tx)*48, (ey - ty)*48) + Math.PI;
	};

	

})();