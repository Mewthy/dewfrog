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
		shortDesc: "+30 BP for each of user's boosts.",
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

	// Chocolate Pudding
	steadybaking: {
		accuracy: 100,
		basePower: 80,
		basePowerCallback(pokemon, target, move) {
			if (!pokemon.volatiles['stockpile']?.layers) return 80;
			return move.basePower + 40 * pokemon.volatiles['stockpile'].layers;
		},
		category: "Physical",
		desc: "Gives the user 1 layer of Stockpile; +40 BP for each layer.",
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
		desc: "This move will critically hit; confuses the target.",
		shortDesc: "Critical; confuse.",
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
		critRatio: 5,
		volatileStatus: 'confusion',
		secondary: null,
		target: "Normal",
		type: "Psychic",
	},

	// Hell
	hadeserinyes: {
		accuracy: 100,
		basePower: 30,
		category: "Special",
		desc: "Hits 3 times. Each hit has a 20% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "Hits 3 times. 20% chance of SpDef drop per hit.",
		name: "Hade's Erinyes",
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

	// Genwunner
	psychicbind: {
		accuracy: 75,
		basePower: 40,
		category: "Special",
		desc: "Traps the target for 4-5 turns; 100% chance to flinch.",
		shortDesc: "Partially traps target; 100% flinch.",
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
		desc: "This move's type is the same as user's; boosts Special Attack and Speed by 1 stage; +5 power for each boost.",
		shortDesc: "Same type as user's; boosts SpA and Spe by 1; +5 BP per boost.",
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

	// Mink the Putrid
	madtoxin: {
		accuracy: 85,
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
	"plagiarize": {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Plagiarize",
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
	"zombiefairy": {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Uses one random move from each fainted ally. All attacking moves called through this effect have their power halved.",
		shortDesc: "Uses moves from fainted allies at halved power.",
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
	"rekindlingofdeadashes": {
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
	"radiationstench": {
		accuracy: 100,
		basePower: 120,
		category: "Physical",
		desc: "Power doubles if the target is poisoned, has a 30% chance to cause the target to flinch, and supresses the target's ability. Move will be either Physical or Special depending on which is stronger.",
		shortDesc: "Power doubles if foe poisoned. 30% flinch chance.",
		name: "Radiation Stench",
		pp: 10,
		priority: 0,
		volatileStatus: 'gastroacid',
		flags: {protect: 1, mirror: 1},
		ignoreImmunity: true,
		onBasePower(basePower, pokemon, target) {
			if (target.status === 'psn' || target.status === 'tox') {
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
		desc: "Usually goes first. Combines Fire into type effectiveness. User switches if below 1/3 max HP.",
		shortDesc: "+Fire-type effectiveness. Switches if below 1/3 HP.",
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
		desc: "Taunts, Torments, and Baton Passes if Hoopa; 80BP Physical Dark-type if Hoopa-Unbound. Ignores opposing stat changes.",
		shortDesc: "Effects vary on forme. Ignores stat changes.",
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

	// Yuuka Kazami
	teradrain: {
		accuracy: true,
		basePower: 100,
		category: "Special",
		desc: "Recovers damage dealt; causes Grassy Terrain and Leech Seed; gives the target Magnet Rise; cures status ailments.",
		shortDesc: "Recovers damage; Grassy Terrain & Leech Seed; gives target Magnet Rise; cures status.",
		name: "Tera Drain",
		gen: 8,
		pp: 10,
		priority: 0,
		flags: {defrost: 1, heal: 1, mirror: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Giga Drain', target);
		},
		self: {
			onHit(pokemon) {
				pokemon.cureStatus();
			},
		},
		volatileStatus: 'leechseed',
		terrain: 'grassyterrain',
		drain: [1, 1],
		secondary: {
			chance: 100,
			volatileStatus: 'magnetrise',
		},
		target: "normal",
		type: "Grass",
	},
};
