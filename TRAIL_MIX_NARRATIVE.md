# TRAIL MIX — Narrative Bible for Claude Code

## Core idea

Trail Mix is not a game about conquering a mountain. It is a moving performance in which a group gradually learns to hear the landscape, one another, and the music as a single system.

Jack walks in front with a wearable DJ controller. Ingrid follows with the portable speaker. The players are not heroic adventurers and the mountain is not an enemy. Their task is to keep the group connected while the city fades, the path changes, and the set becomes shaped by weather, breath, footsteps and attention.

The central question is:

**Can a DJ set become a way of moving through a place together rather than simply playing music inside it?**

## Tone

Warm, playful, grounded, slightly strange and emotionally sincere.

Avoid:
- fantasy prophecy
- combat language
- chosen-one narratives
- mystical clichés
- treating nature as a passive aesthetic backdrop
- references to Mare or Mare's Breath

The world may feel enchanted, but the enchantment comes from attention, rhythm, shared movement and the shifting landscape.

## Player role

The player is the invisible coordinator of the hike. They do not directly control Jack or Ingrid like platform characters. Instead, they shape the group's pace, listening and choices.

The player manages three connected values:

- **Energy** — whether the group can keep moving
- **Connection** — whether people still feel part of the same experience
- **Attention** — whether the group is noticing the place rather than consuming it

No value should simply mean “winning.” Moving faster may raise energy but reduce attention. Stopping may deepen connection but make the group cold. A good journey is a changing balance rather than a perfect score.

## Story structure

### Chapter 1 — Loading In

The city is still loud. Cables are checked, water bottles are packed and the first people arrive unsure whether this is a hike, a performance or both.

Jack tests the controller.
Ingrid checks the speaker straps.
The first bass pulse is almost lost beneath traffic.

Player choice:
- Start with an immediate beat
- Let the city remain audible
- Ask the group to introduce themselves

Narrative purpose:
Establish that the group begins as strangers and that the set is not complete before they arrive.

### Chapter 2 — Leaving the City

The road narrows into trail. Notifications, engines and voices begin to recede. The group's walking pace creates an accidental rhythm.

The music does not replace the city at once. It absorbs fragments of it.

Player choice:
- Match the music to the walking pace
- Slow the group and listen
- Let someone else choose the next sound

Narrative purpose:
Show the transition from audience to participants.

### Chapter 3 — Under the Trees

The forest changes how the music travels. Bass becomes physical. High frequencies disappear into leaves. The group can no longer see the full route ahead.

A person near the back begins falling behind.

Player choice:
- Lower the tempo
- Ask Ingrid to move closer to the back
- Keep the current momentum and trust the group to adapt

Narrative purpose:
Turn care into a mechanic. The “best” musical choice may not be the best collective choice.

### Chapter 4 — The Climb

Conversation becomes shorter. Breath and footsteps become louder than the track. Jack cannot constantly mix while climbing, so the music becomes simpler.

The path asks for effort without becoming an enemy.

Player choice:
- Strip the track down to rhythm and breath
- Stop at a small overlook
- Let the group vote on whether to continue

Narrative purpose:
The set becomes collaborative because physical limitation removes total control.

### Chapter 5 — The View

The group reaches an overlook. Bergen is visible below, but the game does not frame this as victory.

Jack lets a track run without touching it.
Ingrid lowers the speaker.
For a moment, the landscape is louder than the music.

Player interaction:
Hold to listen. The longer the player waits without pressing anything, the more environmental detail becomes audible and visible.

Possible line:
**Nobody says we made it. We are simply here at the same time.**

Narrative purpose:
Create the emotional centre through stillness rather than spectacle.

### Chapter 6 — The Shared Set

On the return, members of the group contribute sounds, memories or small choices. The hierarchy between DJ, sound carrier and audience begins to soften.

The set now contains:
- footsteps
- fragments of conversation
- weather
- sounds selected earlier
- traces of the city's opening noise

Player choice:
Choose which earlier sound returns, not which ending is “correct.”

Narrative purpose:
Show that the route has become an archive of the group.

### Chapter 7 — The Descent

The same trail feels unfamiliar in different light. The group is tired, looser and more connected. Music is no longer guiding every step.

Jack packs down part of the controller.
Ingrid keeps one small speaker playing.
The last track is quieter than the first.

Final choice:
- Let the track finish before the city
- Carry it back into the streets
- End with footsteps only

Final line:
**The set ends. The route keeps playing in us.**

## Replay structure

Each new walk can change:
- route
- weather
- time of day
- music genre
- group mood
- environmental sound
- story fragments
- balance between energy, connection and attention

The point is not to unlock a “true ending.” Each route produces a different memory of moving together.

## Dialogue style

Use short, human lines.

Jack:
- “Give me ten seconds. The path changed the mix.”
- “We can slow down. The mountain isn't going anywhere.”
- “I thought I was leading. Apparently the tempo is.”

Ingrid:
- “The people at the back can't hear us.”
- “Turn it down for a second. Listen to that.”
- “The speaker is heavy, but the silence would be heavier.”
- “We don't need a drop here.”

Group:
- “Is this still part of the set?”
- “I can hear the city from here.”
- “Wait. Let everyone catch up.”
- “Play the one from before, but quieter.”

## Claude Code implementation brief

Use the assets in this folder as visual references.

First:
1. Inspect the existing `trail-mix.html`.
2. Preserve working interactions.
3. Add the narrative as data, not hard-coded scattered strings.
4. Create `story-data.js` or `story-data.json`.
5. Represent each chapter with:
   - id
   - title
   - opening text
   - environmental state
   - available choices
   - stat effects
   - character dialogue
   - transition condition
6. Keep the experience mobile-first and compatible with GitHub Pages.
7. Do not turn it into a platformer or combat game.
8. Do not reference Mare.
9. Use the extracted sprites as prototypes only until clean final animations exist.

Suggested data shape:

```js
{
  id: "under-the-trees",
  title: "Under the Trees",
  environment: {
    light: "forest",
    weather: "still",
    soundscape: "muffled"
  },
  opening: "The trees change how the music travels.",
  choices: [
    {
      label: "Lower the tempo",
      effects: { energy: -1, connection: 2, attention: 1 },
      response: "The people at the back begin walking with the group again."
    }
  ]
}
```
