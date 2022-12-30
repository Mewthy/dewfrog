import {getName} from './conditions';
import {changeSet, changeMoves} from "./abilities";
import {ssbSets} from "./random-teams";

export const Moves: {[k: string]: ModdedMoveData} = {
	// A Resident No-Life
	risingsurge: {
		accuracy: true,
		basePower: 30,
		basePowerCallback(pokemon, target, move) {
			return move.basePower + 30 * pokemon.positiveBoosts();
		},
		category: "Physical",
		desc: "+30 power for each of the user's stat boosts.",
		shortDesc: "+30 BP/boost",
		name: "Rising Surge",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Play Rough', target);
		},
		secondary: null,
		target: "normal",
		type: "Fairy",
	},

	// Back At My Day
	nom: {
		accuracy: true,
		basePower: 100,
		category: "Physical",
		desc: "Restores user's item.",
		shortDesc: "Restores item.",
		name: "Nom",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Bite', target);
		},
		self: {
			onHit(pokemon) {
				if (pokemon.item || !pokemon.lastItem) return false;
				const item = pokemon.lastItem;
				pokemon.lastItem = '';
				this.add('-item', pokemon, this.dex.items.get(item), '[from] move: Nom');
				pokemon.setItem(item);
			},
		},
		secondary: null,
		target: "normal",
		type: "Normal",
	},

	// Bahamut
	megaflare: {
		accuracy: true,
		basePower: 0,
		damage: 150,
		category: "Special",
		desc: "Deals 150 damage; ignores ability, protection and substitute.",
		shortDesc: "150 damage; ignores ability, protect and sub.",
		name: "Megaflare",
		gen: 8,
		pp: 5,
		priority: 0,
		flags: {bypasssub: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Explosion', target);
		},
		ignoreAbility: true,
		secondary: null,
		target: "normal",
		type: "???",
	},

	// Bleu
	bluemagic: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Prevents moves from affecting the user this turn; Sunny Day if the user is Fire-type; Electric Terrain if Electric; Hail and Aurora Veil if Ice; otherwise, fully heals HP and status condition but lowers Defense and Special Defense by 1 stage; this move's type is the same as the user's.",
		shortDesc: "Protection; effect depends on user's type; same type as user's.",
		name: "Blue Magic",
		gen: 8,
		pp: 5,
		priority: 4,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Protect', source);
		},
		onTryHit(pokemon) {
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
			if (pokemon.types[0] === 'Electric') {
				this.actions.useMove('Electric Terrain', pokemon);
			} else if (pokemon.types[0] === 'Fire') {
				this.actions.useMove('Sunny Day', pokemon);
			} else if (pokemon.types[0] === 'Ice') {
				this.actions.useMove('Hail', pokemon);
				this.actions.useMove('Aurora Veil', pokemon);
			} else {
				this.heal(pokemon.maxhp);
				pokemon.cureStatus();
				this.boost({def: -1, spd: -1}, pokemon);
			}
		},
		onModifyType(move, pokemon, target) {
			move.type = pokemon.types[0];
		},
		stallingMove: true,
		volatileStatus: 'protect',
		secondary: null,
		target: "self",
		type: "???",
	},

	// Brookeee
	masochism: {
		accuracy: true,
		basePower: 80,
		category: "Physical",
		desc: "This move is more likely to become a critical hit the higher the user's Attack stage is.",
		shortDesc: "Crit rate increases in proportion to user's Attack stage.",
		name: "Masochism",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Close Combat', target);
		},
		onModifyCritRatio(boosts, critRatio) {
			if (boosts['atk'] >= 1) return critRatio + boosts['atk'];
		},
		secondary: null,
		target: "normal",
		type: "Fighting",
	},

	// ☆Chandie
	conflagration: {
		accuracy: 100,
		basePower: 100,
		category: "Special",
		desc: "Burns target; consumes target's burn to heal 50% of damage dealt.",
		shortDesc: "Burns; consumes burn to heal 50% of damage.",
		name: "Conflagration",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {heal: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Flamethrower', source);
		},
		onModifyMove(move, target) {
			if (target.status === 'brn') move.drain = [1, 2];
		},
		onHit(target) {
			if (target.status === 'brn') target.cureStatus();
		},
		status: 'brn',
		secondary: null,
		target: "normal",
		type: "Fire",
	},

	// Chocolate Pudding
	steadybaking: {
		accuracy: 100,
		basePower: 80,
		basePowerCallback(pokemon, target, move) {
			if (!pokemon.volatiles['stockpile']?.layers) return 80;
			return move.basePower + 40 * pokemon.volatiles['stockpile'].layers;
		},
		category: "Physical",
		desc: "Gives the user 1 layer of Stockpile; +40 power for each layer.",
		shortDesc: "+1 Stockpile; +40 BP for each.",
		name: "Steady Baking",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Stockpile', source);
			this.add('-anim', source, 'Spit Up', target);
		},
		self: {
			volatileStatus: 'stockpile',
			noCopy: true,
			onStart(target) {
				this.effectState.layers = 1;
				this.effectState.def = 0;
				this.effectState.spd = 0;
				this.add('-start', target, 'stockpile' + this.effectState.layers);
				const [curDef, curSpD] = [target.boosts.def, target.boosts.spd];
				this.boost({def: 1, spd: 1}, target, target);
				if (curDef !== target.boosts.def) this.effectState.def--;
				if (curSpD !== target.boosts.spd) this.effectState.spd--;
			},
			onRestart(target) {
				if (this.effectState.layers >= 3) return false;
				this.effectState.layers++;
				this.add('-start', target, 'stockpile' + this.effectState.layers);
				const curDef = target.boosts.def;
				const curSpD = target.boosts.spd;
				this.boost({def: 1, spd: 1}, target, target);
				if (curDef !== target.boosts.def) this.effectState.def--;
				if (curSpD !== target.boosts.spd) this.effectState.spd--;
			},
			onEnd(target) {
				if (this.effectState.def || this.effectState.spd) {
					const boosts: SparseBoostsTable = {};
					if (this.effectState.def) boosts.def = this.effectState.def;
					if (this.effectState.spd) boosts.spd = this.effectState.spd;
					this.boost(boosts, target, target);
				}
				this.add('-end', target, 'Stockpile');
				if (this.effectState.def !== this.effectState.layers * -1 || this.effectState.spd !== this.effectState.layers * -1) {
					this.hint("In Gen 7, Stockpile keeps track of how many times it successfully altered each stat individually.");
				}
			},
		},
		secondary: null,
		target: "normal",
		type: "Fire",
	},

	// El Capitan
	tenaciousrush: {
		accuracy: true,
		basePower: 0,
		basePowerCallback(pokemon, target) {
			const ratio = pokemon.hp * 48 / pokemon.maxhp;
			if (ratio < 2) {
				return 200;
			}
			if (ratio < 5) {
				return 150;
			}
			if (ratio < 10) {
				return 120;
			}
			if (ratio < 17) {
				return 100;
			}
			if (ratio < 33) {
				return 80;
			}
			return 60;
		},
		category: "Physical",
		desc: "This move has more base power the less HP the user has left; damages Fairy.",
		shortDesc: "More BP the less HP the user has left; damages Fairy.",
		name: "Tenacious Rush",
		gen: 8,
		pp: 5,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Draco Meteor', source);
			this.add('-anim', source, 'Dragon Rush', target);
		},
		onModifyMove(move, pokemon) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Dragon'] = true;
			}
		},
		secondary: null,
		target: "normal",
		type: "Dragon",
	},

	// Finger
	megametronome: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Picks and uses 3 random consecutive moves.",
		shortDesc: "Uses 3 random moves.",
		name: "Mega Metronome",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Metronome', source);
		},
		noMetronome: [
			"After You", "Assist", "Aura Wheel", "Baneful Bunker", "Beak Blast", "Belch", "Bestow", "Celebrate", "Clangorous Soul", "Copycat", "Counter", "Covet", "Crafty Shield", "Decorate", "Destiny Bond", "Detect", "Endure", "Eternabeam", "False Surrender", "Feint", "Focus Punch", "Follow Me", "Freeze Shock", "Helping Hand", "Hold Hands", "Hyperspace Fury", "Hyperspace Hole", "Ice Burn", "Instruct", "King's Shield", "Light of Ruin", "Mat Block", "Me First", "Metronome", "Mimic", "Mirror Coat", "Mirror Move", "Obstruct", "Overdrive", "Photon Geyser", "Plasma Fists", "Precipice Blades", "Protect", "Pyro Ball", "Quash", "Quick Guard", "Rage Powder", "Relic Song", "Secret Sword", "Shell Trap", "Sketch", "Sleep Talk", "Snap Trap", "Snarl", "Snatch", "Snore", "Spectral Thief", "Spiky Shield", "Spirit Break", "Spotlight", "Struggle", "Switcheroo", "Transform", "Wide Guard",
		],
		onHit(target, source, effect) {
			const moves = this.dex.moves.all().filter(move => (
				(![2, 4].includes(this.gen) || !source.moves.includes(move.id)) &&
				!move.realMove && !move.isZ && !move.isMax &&
				(!move.isNonstandard || move.isNonstandard === 'Unobtainable') &&
				!effect.noMetronome!.includes(move.name)
			));
			let randomMove = '';
			let randomMove2 = '';
			let randomMove3 = '';
			if (moves.length) {
				moves.sort((a, b) => a.num - b.num);
				randomMove = this.sample(moves).id;
				randomMove2 = this.sample(moves).id;
				randomMove3 = this.sample(moves).id;
			}
			if (!randomMove || !randomMove2 || !randomMove3) return false;
			this.actions.useMove(randomMove, target);
			this.actions.useMove(randomMove2, target);
			this.actions.useMove(randomMove3, target);
		},
		secondary: null,
		target: "self",
		type: "Fairy",
		contestType: "Cool",
	},

	// Finger
	fearthefinger: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Picks and uses random moves consecutively until either the user or the target has fainted.",
		shortDesc: "Uses random moves until user or target faints.",
		name: "Fear the Finger",
		isZ: "metronomiumz",
		gen: 8,
		pp: 1,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Night Shade', target);
		},
		noMetronome: [
			"After You", "Assist", "Aura Wheel", "Baneful Bunker", "Beak Blast", "Belch", "Bestow", "Celebrate", "Clangorous Soul", "Copycat", "Counter", "Covet", "Crafty Shield", "Decorate", "Destiny Bond", "Detect", "Endure", "Eternabeam", "False Surrender", "Feint", "Focus Punch", "Follow Me", "Freeze Shock", "Helping Hand", "Hold Hands", "Hyperspace Fury", "Hyperspace Hole", "Ice Burn", "Instruct", "King's Shield", "Light of Ruin", "Mat Block", "Me First", "Metronome", "Mimic", "Mirror Coat", "Mirror Move", "Obstruct", "Overdrive", "Photon Geyser", "Plasma Fists", "Precipice Blades", "Protect", "Pyro Ball", "Quash", "Quick Guard", "Rage Powder", "Relic Song", "Secret Sword", "Shell Trap", "Sketch", "Sleep Talk", "Snap Trap", "Snarl", "Snatch", "Snore", "Spectral Thief", "Spiky Shield", "Spirit Break", "Spotlight", "Struggle", "Switcheroo", "Transform", "Wide Guard",
		],
		onHit(target, source, effect) {

			let moveCount = [1, 2];
			for (const i of moveCount) {

				if (i <= moveCount.length) {

					const moves = this.dex.moves.all().filter(move => (
						(![2, 4].includes(this.gen) || !source.moves.includes(move.id)) &&
						!move.realMove && !move.isZ && !move.isMax &&
						(!move.isNonstandard || move.isNonstandard === 'Unobtainable') &&
						!effect.noMetronome!.includes(move.name)
					));

					let randomMove = '';
					if (moves.length) {
						moves.sort((a, b) => a.num - b.num);
						randomMove = this.sample(moves).id;
					}
					if (!randomMove) return false;
					this.actions.useMove(randomMove, target);

					let foe = target.side.foe.active[0];

					if (foe.hp > 0 || foe && !foe.fainted) {
						if (i === moveCount.length) {
							moveCount.push(i + 1);
						}
					} else if (foe.fainted || !foe || target.fainted || !target) {
						break;
					}
				}
			}
		},
		secondary: null,
		target: "self",
		type: "Dark",
		contestType: "Cool",
	},

	// flufi
	cranberrycutter: {
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		desc: "Always results in a critical hit; confuses the target.",
		shortDesc: "Crits; confuses target.",
		name: "Cranberry Cutter",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Topsy Turvy', target);
			this.add('-anim', source, 'Psychic', target);
			this.add('-anim', source, 'Sky Drop', target);
		},
		willCrit: true,
		volatileStatus: 'confusion',
		secondary: null,
		target: "Normal",
		type: "Psychic",
	},
	
	// Genwunner
	psychicbind: {
		accuracy: 75,
		basePower: 40,
		category: "Special",
		desc: "Traps the target for 4-5 turns; flinches target.",
		shortDesc: "Partially traps and flinches target.",
		name: "Psychic Bind",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Psychic', target);
		},
		volatileStatus: 'partiallytrapped',
		secondary: {
			chance: 100,
			volatileStatus: 'flinch',
		},
		target: "normal",
		type: "Psychic",
	},

	// Hell
	plutoserinyes: {
		accuracy: 100,
		basePower: 30,
		category: "Special",
		desc: "Hits 3 times. Each hit has a 20% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "Hits 3 times. 20% chance of SpDef drop per hit.",
		name: "Pluto's Erinyes",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {bullet: 1, protect: 1, mirror: 1},
		multihit: 3,
		secondary: {
			chance: 20,
			boosts: {
				spd: -1,
			},
		},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Spectral Thief', target);
		},
		target: "normal",
		type: "Ghost",
	},

	// Hibachi
	washingmachine: {
		accuracy: 100,
		basePower: 0,
		category: "Special",
		desc: "Instantly faints the target but lowers Attack and Speed by 2 stages; fails if target attacks.",
		shortDesc: "OHKO's target but -2 Atk & Spe; fails if target attacks.",
		name: "Washing Machine",
		gen: 8,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {bullet: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Light That Burns the Sky', target);
		},
		onTry(source, target) {
			const action = this.queue.willMove(target);
			const move = action?.choice === 'move' ? action.move : null;
			if (move && move.category !== 'Status') {
				return false;
			}
		},
		self: {
			boosts: {
				atk: -2,
				spe: -2,
			},
		},
		ohko: true,
		secondary: null,
		target: "normal",
		type: "???",
	},

	// Horrific17
	meteorcharge: {
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		desc: "Causes intense sunlight for 5 turns; has 33% recoil.",
		shortDesc: "Sunlight; 33% recoil.",
		name: "Meteor Charge",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {contact: 1, defrost: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Flare Blitz', target);
		},
		weather: 'sunnyday',
		recoil: [33, 100],
		secondary: null,
		target: "normal",
		type: "Fire",
	},

	// Horrific17
	finaltrick: {
		accuracy: true,
		basePower: 150,
		category: "Physical",
		desc: "Causes Desolate Land permanently; burns and traps target for 4-5 turns.",
		shortDesc: "Desolate Land; burns and partially traps target.",
		name: "Final Trick",
		gen: 8,
		pp: 1,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Extreme Evoboost', source);
			this.add('-anim', source, 'Flare Boost', target);
		},
		isZ: "horrifiumz",
		status: 'brn',
		self: {
			onHit(source) {
				this.field.setWeather('desolateland');
			},
		},
		secondary: {
    		volatileStatus: 'partiallytrapped',
		},
		target: "normal",
		type: "Fire",
	},

	// Kaiser Dragon
	ultima: {
		accuracy: true,
		basePower: 40,
		basePowerCallback(pokemon, target, move) {
			return move.basePower + 5 * pokemon.positiveBoosts();
		},
		category: "Special",
		desc: "This move's type is the same as the user's; boosts Special Attack and Speed by 1 stage; +5 power for each boost.",
		shortDesc: "Same type as user's; boosts SpA and Spe by 1; +5 BP/boost.",
		name: "Ultima",
		gen: 8,
		pp: 40,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Explosion', target);
		},
		onModifyType(move, pokemon, target) {
			move.type = pokemon.types[0];
		},
		self: {
			boosts: {
				spa: 1,
				spe: 1,
			},
		},
		secondary: null,
		target: "normal",
		type: "???"
	},

	// Katt
	devilcharge: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "User survives attacks this turn with at least 1 HP; boosts Attack and Speed by 1 stage.",
		shortDesc: "Survives attacks; +1 Atk/Spe.",
		name: "Devil Charge",
		gen: 8,
		pp: 10,
		priority: 4,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Bulk Up', source);
		},
		onTryHit(pokemon) {
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
		},
		stallingMove: true,
		volatileStatus: 'endure',
		boosts: {
			atk: 1,
			spe: 1,
		},
		secondary: null,
		target: "self",
		type: "Dark",
	},

	// Katt
	counterattack: {
		accuracy: true,
		basePower: 0,
		damageCallback(pokemon) {
			const lastDamagedBy = pokemon.getLastDamagedBy(true);
			if (lastDamagedBy !== undefined) {
				return (lastDamagedBy.damage) || 1;
			}
			return 0;
		},
		category: "Physical",
		desc: "Returns damage received if attacked.",
		shortDesc: "Returns damage.",
		name: "Counterattack",
		gen: 8,
		pp: 20,
		priority: -5,
		flags: {contact: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'High Jump Kick', target);
		},
		onTry(source) {
			const lastDamagedBy = source.getLastDamagedBy(true);
			if (lastDamagedBy === undefined || !lastDamagedBy.thisTurn) return false;
		},
		onModifyTarget(targetRelayVar, source, target, move) {
			const lastDamagedBy = source.getLastDamagedBy(true);
			if (lastDamagedBy) {
				targetRelayVar.target = this.getAtSlot(lastDamagedBy.slot);
			}
		},
		secondary: null,
		target: "scripted",
		type: "???",
	},

	// LandoriumZ
	crossdance: {
		accuracy: 100,
		basePower: 90,
		category: "Physical",
		desc: "This move confuses the user.",
		shortDesc: "Confuses user.",
		name: "Cross Dance",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Cross Poison', target);
		},
		self: {
			volatileStatus: 'confusion',
		},
		secondary: null,
		target: "normal",
		type: "Poison",
	},

	// Mayie
	sacredpenance: {
		accuracy: true,
		basePower: 120,
		category: "Special",
		desc: "User fully restores HP; cures the user's party of all status conditions; badly poisons the target.",
		shortDesc: "+100% HP; cures party's status; badly poisons.",
		name: "Sacred Penance",
		gen: 8,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {heal: 1},
		status: 'tox',
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Oblivion Wing', target);
		},
		onAfterMove(pokemon) {
			this.heal(pokemon.maxhp);
		},
		self: {
			onHit(pokemon, source, move) {
				this.add('-activate', source, 'move: Sacred Penance');
				for (const ally of source.side.pokemon) {
					ally.cureStatus();
				}
			},
		},
		secondary: null,
		target: "normal",
		type: "Fairy",
	},

	// Mechagodzilla
	rocketpunch: {
		accuracy: 100,
		basePower: 75,
		category: "Physical",
		desc: "Hits the target again on the second turn.",
		shortDesc: "Hits again on turn 2.",
		name: "Rocket Punch",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		basePowerCallback() {
			return 75;
		},
		ignoreImmunity: true,
		onHit(target, source) {
			if (!target.side.addSlotCondition(target, 'futuremove')) return false;
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				duration: 2,
				move: 'rocketpunch',
				source: source,
				moveData: {
					id: 'rocketpunch',
					name: "Rocket Punch",
					accuracy: 100,
					basePower: 75,
					category: "Physical",
					priority: 0,
					flags: {},
					ignoreImmunity: false,
					effectType: 'Move',
					isFutureMove: true,
					type: 'Steel',
				},
			});
			return null;
		},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Dynamic Punch', target);
		},
		secondary: null,
		target: "normal",
		type: "Steel",
	},

	// Mewth
	oblivionbanisher: {
		accuracy: 100,
		basePower: 90,
		category: "Special",
		desc: "Target is heal blocked and 20% chance to be put to sleep.",
		shortDesc: "Heal Block; 20% Sleep chance.",
		name: "Oblivion Banisher",
		gen: 8,
		pp: 5,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Agility', source);
			this.add('-anim', source, 'Black Hole Eclipse', target);
		},
		volatileStatus: 'healblock',
		secondary: {
			chance: 20,
			status: 'slp',
		},
		target: "allAdjacent",
		type: "Ghost",
	},

	// Mewth
	nightmarerealm: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "For 5 turns, Non Ghost types take 1/16th damage; Fairy moves get boosted by 1.5x; Sleeping Pokemon get inflicted with Nightmare.",
		shortDesc: "1/16th damage to Non Ghost; Fairy moves 1.3x boost; Nightmare on sleeping targets.",
		name: "Nightmare Realm",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Agility', source);
		},
		terrain: 'nightmarerealm',
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onSetStatus(status, target, source, effect) {
				if (status.id === 'slp' && target.isGrounded() && !target.isSemiInvulnerable()) {
					if (effect.effectType === 'Move' && !effect.secondaries) {
						this.add('-activate', target, 'move: Nightmare Realm');
					}
					return true;
				}
			},
			onTryAddVolatile(status, target) {
				if (!target.isGrounded() || target.isSemiInvulnerable()) return;
				if (status.id === 'nightmare') {
					this.add('-activate', target, 'move: Nightmare Realm');
					return true;
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, attacker, defender, move) {
				if (move.type === 'Fairy' && attacker.isGrounded() && !attacker.isSemiInvulnerable()) {
					this.debug('nighatmre realm boost');
					return this.chainModify(1.5);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'move: Nightmare Realm', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Nightmare Realm');
				}
				this.add('-message', 'The battlefield became dark! Sweet dreams!');
			},
			onResidualOrder: 5,
			onResidualSubOrder: 1,
			onResidual(pokemon) {
				if (!pokemon.hasType('Ghost')) this.damage(pokemon.baseMaxhp / 16, pokemon);
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Nightmare Realm');
			},
		},
		secondary: null,
		target: "all",
		type: "Ghost",
	},

	// Mink the Putrid
	madtoxin: {
		accuracy: 90,
		basePower: 0,
		category: "Status",
		desc: "Very badly poisons the target; ignores typing and protection.",
		shortDesc: "Very badly poisons regardless of typing or protection.",
		name: "Mad Toxin",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {bypasssub: 1, snatch: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Agility', source);
			this.add('-anim', source, 'Gunk Shot', target);
		},
		status: 'badtox',
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Tough",
	},

	// Mirāju
	illusiveenergy: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "The user's Special Attack becomes double the user's current HP the moment this move was used.",
		shortDesc: "User's SpA = 2x current HP.",
		name: "Illusive Energy",
		gen: 8,
		pp: 5,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hypnosis', source);
		},
		volatileStatus: 'illusiveenergy',
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'Illusive Energy');
				const newspa = pokemon.hp * 2;
				pokemon.storedStats.spa = newspa;
			},
			onCopy(pokemon) {
				const newspa = pokemon.hp * 2;
				pokemon.storedStats.spa = newspa;
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Illusive Energy');
				const newspa = pokemon.hp * 2;
				pokemon.storedStats.spa = newspa;
			},
			onRestart(pokemon) {
				pokemon.removeVolatile('Illusive Energy');
			},
		},
		secondary: null,
		target: "self",
		type: "Ghost",
		contestType: "Clever",
	},

	// Neptune
	goldenorder: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Golden Order effect starts for the user; halves damage taken from attacks, makes the user move last, and allows the usage of Faith Fray the Damned.",
		shortDesc: "Starts Golden Order for user.",
		name: "Golden Order",
		gen: 8,
		pp: 5,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Extreme Evoboost', source);
			this.add('-anim', source, 'Aerial Ace', target);
		},
		volatileStatus: 'goldenorder',
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'Golden Order');
				pokemon.m.nowShiny = true;
				changeSet(this, pokemon, ssbSets['Golden Neptune'], true);
			},
			onSourceModifyDamage(damage, source, target, move) {
				return this.chainModify(0.5);
			},
			onModifyPriority(priority, pokemon, target, move) {
				return priority - 5;
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Golden Order');
				pokemon.m.nowShiny = false;
				changeSet(this, pokemon, ssbSets['Neptune'], true);
			},
			onRestart(pokemon) {
				pokemon.removeVolatile('Golden Order');
				pokemon.m.nowShiny = false;
				changeSet(this, pokemon, ssbSets['Neptune'], true);
			},
		},
		secondary: null,
		target: "self",
		type: "Flying",
	},

	// Neptune
	faithfraythedamned: {
		accuracy: 100,
		basePower: 200,
		category: "Physical",
		desc: "Ignores resistance and immunity; super-effective against Ghost-types; user faints to boost replacement's Speed and Defense by 1 stage.",
		shortDesc: "Ignores resistance and immunity; SE against Ghost; boosts replacement's Spe and Def by 1.",
		name: "Faith Fray the Damned",
		gen: 8,
		pp: 1,
		priority: 0,
		flags: {},
		ignoreImmunity: true,
		selfdestruct: "ifHit",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Extreme Evoboost', source);
			this.add('-anim', source, 'Pulverizing Pancake', target);
		},
		onEffectiveness(typeMod, target, type, move) {
			if (target.hasType('Ghost')) {
				return 1;
			} else {
				return 0;
			}
		},
		self: {
			sideCondition: 'faithfraythedamned',
		},
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'move: Faith Fray the Damned');
			},
			onSwitchInPriority: -1,
			onSwitchIn(target) {
				this.add('-activate', target, 'move: Faith Fray the Damned', target);
				this.boost({def: 1, spe: 1}, target);
			},
		},
		secondary: null,
		target: "normal",
		type: "Normal",
	},

	// Omega
	wavecannon: {
		accuracy: true,
		basePower: 0,
		category: "Special",
		desc: "Deals 1/3 of the target's max HP; prevents the target from healing.",
		shortDesc: "Deals 1/3 HP; prevents healing.",
		name: "Wave Cannon",
		gen: 8,
		pp: 5,
		priority: 0,
		flags: {bypasssub: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hyper Beam', target);
		},
		onHit(target) {
			this.directDamage(Math.ceil(target.maxhp / 3));
		},
		volatileStatus: 'healblock',
		ignoreAbility: true,
		secondary: null,
		target: "normal",
		type: "Steel",
	},

	// Pablo
	plagiarize: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Plagiarize",
		desc: "Replaces this move with the target's last move and said move becomes 0 PP.",
		shortDesc: "Replaced with target's last move and said move becomes 0 PP.",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {protect: 1, bypasssub: 1, allyanim: 1},
		onHit(target, source) {
			const disallowedMoves = [
				'behemothbash', 'behemothblade', 'chatter', 'dynamaxcannon', 'mimic', 'sketch', 'struggle', 'transform',
			];
			const move = target.lastMove;
			if (source.transformed || !move || disallowedMoves.includes(move.id) || source.moves.includes(move.id)) {
				return false;
			}
			if (move.isZ || move.isMax) return false;
			const mimicIndex = source.moves.indexOf('mimic');
			if (mimicIndex < 0) return false;

			source.moveSlots[mimicIndex] = {
				move: move.name,
				id: move.id,
				pp: move.pp,
				maxpp: move.pp,
				target: move.target,
				disabled: false,
				used: false,
				virtual: true,
			};
			this.add('-start', source, 'Plagiarize', move.name);

			if (!move || move.isZ) return false;
			if (move.isMax && move.baseMove) move = this.dex.moves.get(move.baseMove);

			const ppDeducted = target.deductPP(move.id, move.pp);
			if (!ppDeducted) return false;
			this.add("-activate", target, 'move: Plagiarize', move.name, ppDeducted);
		},
		secondary: null,
		target: "normal",
		type: "Normal",
	},

	// Rin Kaenbyou
	zombiefairy: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Uses a random move from each fainted ally at 0.5x power.",
		shortDesc: "Uses moves from fainted allies at 0.5x BP.",
		name: "Zombie Fairy",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onHit(target) {
			let moves = [];
			for (const pokemon of target.side.pokemon) {
				if (pokemon === target) continue;
				if (!pokemon.fainted) continue;
				let lastFainted = '';
				moves = [];
				for (const moveSlot of pokemon.moveSlots) {
					const moveid = moveSlot.id;
					const move = this.dex.moves.get(moveid);
					if (move.isZ || move.isMax) {
						continue;
					}
					moves.push(moveid);
				}
				if (!moves.length) {
					return false;
				}
				this.actions.useMove(this.sample(moves), target);
			}
		},
		target: "self",
		type: "Fairy",
	},

	// Rin Kaenbyou
	rekindlingofdeadashes: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Revives all fainted allies, restoring them to 1 HP each.",
		shortDesc: "Revives all fainted allies at 1 HP.",
		name: "Rekindling of Dead Ashes",
		gen: 8,
		isZ: "riniumz",
		pp: 1,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onHit(target) {
			for (const pokemon of target.side.pokemon) {
				if (pokemon === target) continue;
				if (!pokemon.fainted) continue;
				pokemon.fainted = false;
				pokemon.heal(1);
			}
			this.add('-message', `The Rekindling of Dead Ashes! ${target.name}'s allies were brought back to life!`);
		},
		target: "self",
		type: "Fairy",
	},
	
	// Roughskull
	radiationstench: {
		accuracy: 100,
		basePower: 120,
		category: "Physical",
		desc: "Power doubles if the target is poisoned; 30% chance to flinch the target; suppresses the target's ability; this move is Physical or Special depending on the user's higher Attack stat.",
		shortDesc: "2x BP if target is poisoned; 30% flinch; suppresses ability; category depends on user's higher Attack.",
		name: "Radiation Stench",
		pp: 10,
		priority: 0,
		volatileStatus: 'gastroacid',
		flags: {protect: 1, mirror: 1},
		ignoreImmunity: true,
		onBasePower(basePower, pokemon, target) {
			if (target.status === 'psn' || target.status === 'tox' || target.status === 'badtox') {
				return this.chainModify(2);
			}
		},
		onModifyMove(move, pokemon, target) {
			if (!target) return;
			const atk = pokemon.getStat('atk', false, true);
			const spa = pokemon.getStat('spa', false, true);
			const def = target.getStat('def', false, true);
			const spd = target.getStat('spd', false, true);
			const physical = Math.floor(Math.floor(Math.floor(Math.floor(2 * pokemon.level / 5 + 2) * 90 * atk) / def) / 50);
			const special = Math.floor(Math.floor(Math.floor(Math.floor(2 * pokemon.level / 5 + 2) * 90 * spa) / spd) / 50);
			if (special > physical || (physical === special && this.random(2) === 0)) {
				move.category = 'Special';
				this.add('-message', `A weak point! Radiation Stench became Special!`);
			}
		},
		onEffectiveness(typeMod, target, type) {
			if (type === 'Steel') return 1;
		},
		secondary: {
			chance: 30,
			volatileStatus: 'flinch',
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Acid Downpour', target);
		},
		target: "normal",
		type: "Poison",
	},
	
	// Ruffbot
	advancedai: {
		accuracy: 100,
		basePower: 120,
		categoy: "Special",
		desc: "This move hits one turn after being used. Changes the type of the user to typeless. Heals 1/4 of the users health. Deals inverse effectiveness to the target.",
		shortDesc: "Hits one turn after use; Becomes typeless; Heals 1/4; Inverse effectiveness.",
		name: "Advanced A.I",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {bypasssub: 1, heal: 1},
		ignoreImmunity: true,
		isFutureMove: true,
		onTry(source, target) {
			if (!target.side.addSlotCondition(target, 'futuremove')) return false;
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				duration: 2,
				move: 'advancedai',
				source: source,
				moveData: {
					id: 'advancedai',
					name: "Advanced A.I",
					accuracy: 100,
					basePower: 120,
					category: "Special",
					priority: 0,
					flags: {bypasssub: 1, heal: 1},
					ignoreImmunity: false,
					effectType: 'Move',
					isFutureMove: true,
					type: 'Normal',
				},
			});
			this.add('-start', source, 'move: Advanced A.I');
			return this.NOT_FAIL;
		},
		onHit(pokemon, source, move) {
			this.heal(pokemon.maxhp / 4, source, source, move);
		},
		onEffectiveness(typeMod, target, type) {
			if (type === 'Steel', 'Rock', 'Ghost') return 1;
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Doom Desire', source);
			this.add('-anim', source, 'Boomburst', source);
		},
		secondary: null,
		target: "normal",
		type: "Normal",

	// Satori
	terrifyinghypnotism: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "This move flinches and Mind Readers the target, then becomes one of six signature moves depending on the target's type.",
		shortDesc: "Flinches and Mind Readers; new sig depending on type.",
		name: "Terrifying Hypnotism",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {bypasssub: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hypnosis', target);
			this.add('-anim', source, 'Mind Reader', target);
		},
		onHit(target, source) {
			let possibleMoves = ["Calm Mind", "Zap Cannon", "Psychic"];
			this.add('-message', `Opponent Typing: ${target.types}`);
			this.add('-message', `Opponent Primary Typing: ${target.types[0]}`);
			if (target.types[0] === "Normal" || target.types[0] === "Rock" || target.types[0] === "Steel") {
				possibleMoves.push("Mt. Togakushi Toss");
			} else if (target.types[0] === "Fighting" || target.types[0] === "Bug" || target.types[0] === "Grass") {
				possibleMoves.push("Torii Whorl-Wind");
			} else if (target.types[0] === "Flying" || target.types[0] === "Electric" || target.types[0] === "Ice") {
				possibleMoves.push("Straw Doll Kamikaze");
			} else if (target.types[0] === "Poison" || target.types[0] === "Ground" || target.types[0] === "Fire") {
				possibleMoves.push("Trauma in the Glimmering Depths");
			} else if (target.types[0] === "Water" || target.types[0] === "Dragon" || target.types[0] === "Dark") {
				possibleMoves.push("Philosopher's Stone");
			} else {
				possibleMoves.push("Border of Wave and Particle");
			}
			const newMoves = possibleMoves;
			const newMoveSlots = changeMoves(this, source, newMoves);
			this.add('-message', `Satori\'s Terrifying Hypnotism transformed into ${possibleMoves[3]}!`);
			source.m.terrifyinghypnotism = true;
			source.moveSlots = newMoveSlots;
			// @ts-ignore
			source.baseMoveSlots = newMoveSlots;
		},
		volatileStatus: 'flinch',
		ignoreAbility: true,
		secondary: {
			chance: 100,
			volatileStatus: 'lockon',
		},
		target: "normal",
		type: "???",
	},

	// Satori
	mttogakushitoss: {
		accuracy: 80,
		basePower: 120,
		category: "Special",
		desc: "This move raises the user's critical hit ratio by 2.",
		shortDesc: "Raises critical hit ratio by 2.",
		name: "Mt. Togakushi Toss",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Focus Blast', target);
		},
		self: {
			volatileStatus: 'focusenergy',
		},
		secondary: null,
		target: "normal",
		type: "Fighting",
	},

	// Satori
	toriiwhorlwind: {
		accuracy: 80,
		basePower: 120,
		category: "Special",
		desc: "This move doubles the user's allies' speed for 4 turns.",
		shortDesc: "2x speed for allies for 4 turns.",
		name: "Torii Whorl-Wind",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hurricane', target);
		},
		self: {
			sideCondition: 'tailwind',
		},
		secondary: null,
		target: "normal",
		type: "Flying",
	},

	// Satori
	strawdollkamikaze: {
		accuracy: 80,
		basePower: 120,
		category: "Special",
		desc: "This move burns the target.",
		shortDesc: "Burns target.",
		name: "Straw Doll Kamikaze",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Explosion', target);
		},
		status: 'brn',
		secondary: null,
		target: "normal",
		type: "Fire",
	},

	// Satori
	traumaintheglimmeringdepths: {
		accuracy: 80,
		basePower: 120,
		category: "Special",
		desc: "This move traps the target.",
		shortDesc: "Traps target.",
		name: "Trauma in the Glimmering Depths",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Whirlpool', target);
		},
		volatileStatus: 'partiallytrapped',
		secondary: null,
		target: "normal",
		type: "Water",
	},

	// Satori
	philosophersstone: {
		accuracy: 80,
		basePower: 120,
		category: "Special",
		desc: "This move sets up Psychic Terrain.",
		shortDesc: "Sets up Psychic Terrain.",
		name: "Philosopher's Stone",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Moonblast', target);
		},
		terrain: 'psychicterrain',
		secondary: null,
		target: "normal",
		type: "Fairy",
	},

	// Satori
	borderofwaveandparticle: {
		accuracy: 80,
		basePower: 120,
		category: "Special",
		desc: "This move curses the target.",
		shortDesc: "Curses target.",
		name: "Border of Wave and Particle",
		gen: 8,
		pp: 15,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Shadow Ball', target);
		},
		volatileStatus: 'curse',
		secondary: null,
		target: "normal",
		type: "Ghost",
	},

	// SunDraco
	einsol: {
		accuracy: 100,
		basePower: 80,
		category: "Physical",
		desc: "+1 priority; combines Fire into type effectiveness; user switches if at or below 1/3 of max HP.",
		shortDesc: "+Fire-type effectiveness; switches if <= 1/3 HP.",
		name: "Ein Sol",
		gen: 8,
		pp: 10,
		priority: 1,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Will-O-Wisp', source);
			this.add('-anim', source, 'Aerial Ace', target);
		},
		onEffectiveness(typeMod, target, type, move) {
			return typeMod + this.dex.getEffectiveness('Fire', type);
		},
		onHit(target, source, move) {
			const willSwitch = source.hp <= source.maxhp / 3;
			if (!willSwitch) {
				delete move.selfSwitch;
			}
		},
		selfSwitch: true,
		secondary: null,
		target: "normal",
		type: "Normal",
	},

	// The Dealer
	tapout: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Taunts, Torments, and Baton Passes if Hoopa; 80 BP Physical Dark-type attack if Hoopa-Unbound; ignores stat stage changes.",
		shortDesc: "Effects vary on form; ignores stat changes.",
		name: "Tap Out",
		pp: 10,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1},
		ignoreEvasion: true,
		ignoreDefensive: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Belly Drum', source);
			if (source.species.name === 'Hoopa-Unbound') {
				this.add('-anim', source, 'Wicked Blow', target);
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.species.name === 'Hoopa-Unbound') {
				move.category = 'Physical';
				move.flags.contact = 1;
				move.type = 'Dark';
				move.basePower = 80;
			} else {
				move.category = 'Status';
				move.flags.contact = 0;
				move.category = 'Ghost';
				move.basePower = 0;
			}
		},
		onHit(target, source, move) {
			if (source.species.name === 'Hoopa') {
				target.addVolatile("taunt");
				target.addVolatile("torment");
				this.actions.useMove('Baton Pass', source);
				this.add('-message', 'The Dealer has tapped out!');
			}
		},
		secondary: null,
		target: "normal",
		type: "Ghost",
	},

	// The Dealer
	rollthedice: {
		accuracy: 100,
		basePower: 0,
		category: "Special",
		desc: "Rolls a number between 1-6 and selects a unique effect and base power depending on the number rolled.",
		shortDesc: "Effects and power are randomly selected.",
		name: "Roll the Dice",
		gen: 8,
		pp: 10,
		priority: 0,
		diceRoll: 0,
		unboundDiceRoll: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Topsy Turvy', source);
			this.add('-anim', source, 'Wish', source);
		},
		onModifyMove(move, pokemon, target) {
			if (pokemon.species.name === 'Hoopa') {
				const rand = this.random(6);
				if (rand === 0) {
					move.basePower = 1;
					move.diceRoll = 1;
				} else if (rand === 1) {
					move.basePower = 60;
					move.diceRoll = 2;
				} else if (rand === 2) {
					move.basePower = 80;
					move.diceRoll = 3;
				} else if (rand === 3) {
					move.basePower = 100;
					move.diceRoll = 4;
				} else if (rand === 4) {
					move.basePower = 120;
					move.diceRoll = 5;
				} else {
					move.diceRoll = 6;
				}
			} else {
				move.priority = 2;
				const rand = this.random(2);
				if (rand === 0) {
					move.unboundDiceRoll = 1;
				} else {
					move.unboundDiceRoll = 2;
				}
			}
		},
		onHit(target, source, move) {
			this.add('-message', 'The Dealer is rolling the dice!');
			if (source.species.name === 'Hoopa') {
				if (move.diceRoll === 1) {
					this.add('-message', 'The dice landed on 1!');
					this.add('-message', 'Better luck next time!');
					this.directDamage(source.maxhp / 4, source, source);
				} else if (move.diceRoll === 2) {
					this.add('-message', 'The dice landed on 2!');
					target.addVolatile('yawn');
					source.addVolatile('yawn');
					target.addVolatile('perishsong');
					source.addVolatile('perishsong');
				} else if (move.diceRoll === 3) {
					this.add('-message', 'The dice landed on 3!');
					this.actions.useMove("Spikes", source);
					this.actions.useMove("Future Sight", source);
				} else if (move.diceRoll === 4) {
					this.add('-message', 'The dice landed on 4!');
					this.actions.useMove("Substitute", source);
					this.actions.useMove("Trick-or-Treat", source);
				} else if (move.diceRoll === 5) {
					this.add('-message', 'The dice landed on 5!');
					this.actions.useMove("Jungle Healing", source);
					this.actions.useMove("Leech Seed", source);
				} else {
					this.add('-message', 'The dice landed on 6!');
					const hoopaForme = source.species.id === 'hoopaunbound' ? '' : '-Unbound';
					source.formeChange('Hoopa' + hoopaForme, this.effect, false, '[msg]');
					this.actions.useMove("Ingrain", source);
					this.actions.useMove("No Retreat", source);
					this.actions.useMove("Mean Look", source);
					this.actions.useMove("Wicked Blow", source);
				}
			} else {
				if (move.unboundDiceRoll === 1) {
					this.actions.useMove("Recover", source);
					const boost: SparseBoostsTable = {};
					let statPlus: BoostID;
					for (statPlus in source.boosts) {
						if (source.boosts[statPlus] < 0 || source.boosts[statPlus] === 6) continue;
						if (source.boosts[statPlus] > 0) {
							boost[statPlus] = source.boosts[statPlus];
						}
					}
					this.boost(boost, source, source, null, true);
					this.add('-message', 'Jackpot! The Dealer\'s stat boosts were doubled!');
				} else {
					source.addVolatile('taunt');
					let success = false;
					let i: BoostID;
					for (i in source.boosts) {
						if (source.boosts[i] === 0) continue;
						source.boosts[i] = -source.boosts[i];
						success = true;
					}
					if (!success) return false;
					this.add('-invertboost', source, '[from] move: Roll the Dice');
					this.add('-message', 'You\'re the weak link! Better luck next time!');
				}
			}
		},
		secondary: null,
		target: "normal",
		type: "???",
	},

	// The Dealer
	thehousealwayswins: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "If Hoopa, uses Roll the Dice twice; otherwise, becomes Dark-type, Physical, 150 BP, steals stat boosts before dealing damage, and faints the user.",
		shortDesc: "Effects and power depend on form.",
		name: "The House Always Wins",
		isZ: "doubleornothing",
		gen: 8,
		pp: 1,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Topsy Turvy', source);
			this.add('-anim', source, 'Night Shade', target);
		},
		onModifyMove(move, pokemon, target) {
			if (pokemon.species.name === 'Hoopa-Unbound') {
				move.type = "Dark",
				move.category = "Physical",
				move.basePower = 150;
				move.stealsBoosts = true;
			}
		},
		onHit(target, source, move) {
			/*if (source.species.name === "Hoopa") {
				this.actions.useMove("Roll the Dice", source);
				this.actions.useMove("Roll the Dice", source);
			}*/
			this.add('-message', 'da move do be hittin');
			if (source.species.name === "Hoopa-Unbound") {
				source.hp = 0;
				source.faint();
			}
		},
		secondary: null,
		stealsBoosts: false,
		target: "normal",
		type: "Ghost",
	},

	// Tonberry
	karma: {
		accuracy: 100,
		basePower: 20,
		category: "Physical",
		desc: "This move additionally hits the target once for each fainted ally of the user's.",
		shortDesc: "Extra hit per fainted ally.",
		name: "Karma",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {contact: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Shadow Punch', target);
		},
		onModifyMove(move, pokemon) {
			move.multihit = 7 - pokemon.side.pokemonLeft;
		},
		secondary: null,
		target: "normal",
		type: "Ghost",
	},
};
