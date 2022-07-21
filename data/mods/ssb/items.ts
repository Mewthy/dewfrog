export const Items: {[k: string]: ModdedItemData} = {
	// Brookeee
	ramen: {
		name: "Ramen",
		spritenum: 22,
		fling: {
			basePower: 10,
		},
		onUpdate(pokemon) {
			pokemon.eatItem();
		},
		onEat(pokemon) {
			this.boost({spe: 1});
			pokemon.addVolatile('focusenergy');
		},
		gen: 8,
		desc: "Raises Speed by 1 stage and critical hit ratio by 2 stages. Single use.",
	},

	// ☆Chandie
	phantompresence: {
		name: "Phantom Presence",
		spritenum: 459,
		fling: {
			basePower: 10,
		},
		onTryHit(pokemon, source, move) {
			if (pokemon !== source && move.type === 'Ground') {
				this.add('-immune', pokemon, '[from] item: Phantom Presence');
				return null;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.flags['contact']) return this.chainModify(0.5);
		},
		gen: 8,
		desc: "Holder is immune to hazards and Ground-type attacks; takes 0.5x damage from contact.",
	},

	// Chocolate Pudding
	parfaitspoon: {
		name: "Parfait Spoon",
		spritenum: 520,
		fling: {
			basePower: 30,
		},
		onModifyDefPriority: 1,
		onModifyDef(def) {
			return this.chainModify(1.5);
		},
		onModifySpDPriority: 1,
		onModifySpD(spd) {
			return this.chainModify(1.5);
		},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, target) {
			if (target.types === 'Ice') {
				return this.chainModify(1.5);
			}
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, source);
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, source);
			return null;
		},
		gen: 8,
		desc: "Reflects status moves; boosts Defense and Special Defense by 1.5x; 1.5x damage to Ice-types.",
	},

	// El Capitan
	assaulthelmet: {
		name: "Assault Helmet",
		fling: {
			basePower: 100,
		},
		onCriticalHit: false,
		gen: 8,
		desc: "Holder cannot be struck by a critical hit.",
	},

	// Finger
	metronomiumz: {
		name: "Metronomium Z",
		spritenum: 632,
		onTakeItem: false,
		zMove: "Fear the Finger",
		zMoveFrom: "Mega Metronome",
		itemUser: ["Reuniclus"],
		gen: 8,
		desc: "If held by a Reuniclus with Mega Metronome, it can use Fear the Finger.",
	},

	// Hell
	airblimp: {
		name: "Air Blimp",
		spritenum: 6,
		fling: {
			basePower: 10,
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') return false;
		},
		onTryHit(pokemon, source, move) {
			if (move.flags['powder'] && pokemon !== source && this.dex.getImmunity('powder', pokemon)) {
				this.add('-activate', pokemon, 'item: Air Blimp', move.name);
				return null;
			}
			if (pokemon !== source && move.type === 'Ground') {
				this.add('-immune', pokemon, '[from] item: Air Blimp');
				return null;
			}
		},
		gen: 8,
		desc: "Holder is immune to Ground-type attacks and ignores weather.",
	},

	// Horrific17
	horrifiumz: {
		name: "Horrifium Z",
		spritenum: 632,
		onTakeItem: false,
		zMove: "Final Trick",
		zMoveFrom: "Meteor Charge",
		itemUser: ["Arcanine"],
		gen: 8,
		desc: "If held by an Arcanine with Meteor Charge, it can use Final Trick.",
	},

	// Mewth
	spiritemblem: {
		name: "Spirit Emblem",
		spritenum: 180,
		fling: {
			basePower: 30,
		},
		onModifyCritRatio(critRatio, move) {
			if (move.type === 'Ghost') {
				return critRatio + 2;
			}
		},
		gen: 8,
		desc: "Holder's critical hit ratio for Ghost-type attacks is increased by 2 stages.",
		shortDesc: "Ghost-type attacks have +2 crit rate.",
	},

	// Mink the Putrid
	gurglingblossom: {
		name: "Gurgling Blossom",
		spritenum: 487,
		fling: {
			basePower: 80,
		},
		onResidualOrder: 5,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hasType('Poison')) this.heal(pokemon.baseMaxhp / 8);
		},
		onDamagingHitOrder: 2,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		gen: 8,
		desc: "Each turn, holder restores 1/8 of max HP if Poison-type. Attacker loses 1/8 of max HP if contact is made.",
	},

	// Neptune
	stormtalisman: {
		name: "Storm Talisman",
		spritenum: 149,
		fling: {
			basePower: 10,
		},
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			const weather = ["hurricane", "thunder", "blizzard", "weatherball", "solarbeam", "solarblade"];
			if (weather.includes(move.id)) {
				return this.chainModify(1.33);
			}
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			const weather = ["hurricane", "thunder", "blizzard", "weatherball", "solarbeam", "solarblade"];
			if (weather.includes(move.id)) {
				return this.chainModify(1.33);
			}
		},
		gen: 8,
		desc: "Weather-based attacks used by the holder have their accuracy and power increased by 1.33x.",
	},

	// Neptune
	peacetalisman: {
		name: "Peace Talisman",
		spritenum: 172,
		fling: {
			basePower: 10,
		},
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			const damagedByTarget = user.attackedBy.some(
				p => p.source === target && p.damage > 0 && p.thisTurn
			);
			if (damagedByTarget) {
				this.debug('Boosted for getting hit by ' + target);
				return this.chainModify(1.25);
			} else {
				if (move.id === "faithfraythedamned") {
					return;
				} else {
					this.debug('Weakened for not getting hit');
					return this.chainModify(0.75);
				}
			}
		},
		gen: 8,
		desc: "Attacks deal 1.25x damage if holder is damaged by foe first; else 0.75x damage.",
	},

	// Rin Kaenbyou
	riniumz: {
		name: "Rinium Z",
		spritenum: 632,
		onTakeItem: false,
		zMove: "Rekindling of Dead Ashes",
		zMoveFrom: "Zombie Fairy",
		itemUser: ["Torracat"],
		gen: 8,
		desc: "If held by a Torracat with Zombie Fairy, it can use Rekindling of Dead Ashes.",
	},

 	// Roughskull
	cheaterglasses: {
		name: "Cheater Glasses",
		spritenum: 35,
		fling: {
			basePower: 10,
		},
		onStart(pokemon) {
			let totaldef = 0;
			let totalspd = 0;
			let totalatk = 0;
			let totalspa = 0;
			for (const target of pokemon.side.foe.active) {
				if (!target || target.fainted) continue;
				totaldef += target.getStat('def', false, true);
				totalspd += target.getStat('spd', false, true);
				totalatk += target.getStat('atk', false, true);
				totalspa += target.getStat('spa', false, true);
			}
			if (totaldef && totaldef >= totalspd) {
				this.boost({spa: 1});
			} else if (totalspd) {
				this.boost({atk: 1});
			}
			if (totalatk && totalatk >= totalspa) {
				this.boost({def: 1});
			} else if (totalspd) {
				this.boost({spd: 1});
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Crown of TMS weaken');
				return this.chainModify(0.5);
			}
		},
		gen: 8,
		desc: "On switch-in, holder raises its Attack or Special Attack depending on foe's lower Defense stat, and raises Defense or Special Defense depending on foe's higher Attack stat.  At full HP, this Pokemon takes 0.5x damage from attacks.",
 	},

	// Ruffbots
	nutsandbolts: {
		name: "Nuts and Bolts",
		spritenum: 273,
		fling: {
			basePower: 30,
		},
		onModifySpAPriority: 1,
		onModifySpA(spa, pokemon) {
			if (pokemon.species.name !== "Pokestar F-00") return false;
			return this.chainModify(1.5);
		},
		onModifySpDPriority: 1,
		onModifySpD(spd, pokemon) {
			if (pokemon.species.name !== "Pokestar F-00") return false;
			return this.chainModify(1.5);
		},
		gen: 8,
		desc: "If held by Pokestar F-00, its Special Attack and Special Defense are 1.5x.",
	},

	// Satori
	thirdeye: {
		name: "Third Eye",
		spritenum: 574,
		fling: {
			basePower: 10,
		},
		onBasePowerPriority: 16,
		onBasePower(basePower, user, target, move) {
			if (move.category === 'Special') {
				return this.chainModify(1.2);
			}
		},
		onModifyAccuracyPriority: -2,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			this.debug('thirdeye - decreasing accuracy');
			return this.chainModify(0.9);
		},
		gen: 8,
		desc: "Boosts the user's Special Attack by 1.2x and evasiveness by 1.1x.",
	},

	// SunDraco
	fanblade: {
		name: "Fanblade",
		spritenum: 698,
		fling: {
			basePower: 50,
			volatileStatus: 'flinch',
		},
		onModifyMovePriority: 1,
		onModifyMove(move) {
			if (!move.multihit && move.basePower <= 60 && move.basePower > 0) {
				const hits = this.random(2, 5);
				move.multihit = hits;
				move.basePower = 20;
			}
		},
		gen: 8,
		desc: "Holder's single-hit moves of <= 60 BP have 20 BP and hit 2-5 times instead.",
	},

	// The Dealer
	doubleornothing: {
		name: "Double or Nothing",
		spritenum: 387,
		onTakeItem: false,
		zMove: "The House Always Wins",
		zMoveFrom: "Roll the Dice",
		itemUser: ["Hoopa", "Hoopa-Unbound"],
		gen: 8,
		desc: "If held by a Hoopa with Roll the Dice, it can use The House Always Wins.",
	},
};
