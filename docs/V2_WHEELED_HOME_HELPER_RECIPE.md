# Wheeled Home Helper V2 — Recipe Worksheet

## Status

**Draft only. Not purchase-ready.** This worksheet separates what Prabin specified, what the current catalogue contains, and what still needs a physical check.

## Product rule for this and future recipes

Start with the smallest safe build that proves the core behaviour. Use the lowest practical load, speed, size, and complexity. Add capacity or features only when the requested behaviour requires them.

## Stated requirements

- Builder: grade 6–8 student with adult supervision.
- Robot: wheeled home helper.
- Job: carry a lightweight object placed on top.
- V2 load limit: 100 g maximum.
- Surface: flat indoor floor only.
- Movement: slow; speed is not a scored outcome.
- Commands: forward, left, right, and stop.
- Voice route: a phone recognises the word and sends the command over Bluetooth.
- Carrying surface: the smallest size that safely fits the selected chassis; do not promise a dimension before measuring the chassis.
- Budget ceiling: ₹10,000, but the recipe must not spend more merely because budget is available.

## One complete V2 outcome

A small wheeled platform carries a load of up to 100 g on a flat indoor floor, responds to forward, left, right, and stop commands sent from a phone, and automatically stops after every short movement command.

## Draft recipe

| Slot | Current catalogue item | Qty | Classification | Reason |
|---|---|---:|---|---|
| Controller | CTRL-001 — Arduino Uno R3 | 1 | Reuse; required | Runs the fixed command and movement logic. |
| Drive motors | MOT-001 — BO Geared DC Motor | 2 | Reuse; needs load test | Moves the two driven wheels. The catalogue does not prove performance with the completed robot plus 100 g. |
| Motor driver | DRV-001 — L298N Motor Driver | 1 | Reuse; needs electrical check | Allows the Arduino to control the motors. Heating and voltage drop must be checked under load. |
| Motor power | PWR-001 — 4×AA Battery Holder | 1 | Reuse; needs runtime check | Supplies low-voltage power. Battery chemistry, voltage under load, and runtime are not yet verified. |
| Voice link | COM-001 — HC-05 Bluetooth Module | 1 | Reuse; required | Receives the phone command after the phone recognises the spoken word. |
| Temporary connections | CON-001 — 830-Point Breadboard | 1 | Reuse; prototype only | Makes the first wiring test easier. Loose connections must be secured before carrying a load. |
| Board wiring | CON-002 — Male-Male Jumper Wires | 10 | Reuse; required for prototype | Connects breadboard and Arduino points. |
| Module wiring | CON-003 — Male-Female Jumper Wires | 10 | Reuse; required for prototype | Connects modules to the controller or breadboard. |
| Programming cable | CON-005 — USB Data Cable | 1 | Reuse if owned | Loads the program onto the Arduino. |
| Rolling base | MECH-001 — 2WD Robot Chassis | 1 | Reuse; needs measurement | Holds the electronics and drive parts. Exact dimensions are not recorded in the catalogue. |
| Wheels | MECH-002 — Robot Wheel | 2 | Reuse; needs fit check | Must fit the selected BO motor shafts. |
| Balance wheel | MECH-003 — Caster Wheel | 1 | Reuse; needs height check | Supports the third contact point and must sit level with the drive wheels. |
| Fasteners | MECH-004 — M3 Screw Nut Spacer Set | 1 set | Reuse; needs fit check | Secures boards and carrying surface without damaging them. |
| Assembly tool | TOOL-002 — Small Screwdriver Set | 1 | Prerequisite; buy only if not owned | Used to assemble the chassis. It is not part of the robot. |
| Carrying surface | Not present as a specific catalogue item | 1 | Missing | A light, rigid surface no larger than needed for the chassis and 100 g load. Exact material and dimensions need selection. |
| Physical power-off control | No beginner-rated exact item selected | 1 | Missing | Lets an adult stop motor power if Bluetooth or software does not respond. |
| Load restraint | Not selected | 1 | Optional, recommended | A shallow edge or non-slip surface helps stop the 100 g item sliding during turns. |

## Required items that are not purchased as robot parts

- Phone with Bluetooth and a tested voice-command method.
- Computer with a working USB port.
- A test load weighing no more than 100 g.
- Flat, clear indoor test area.
- Adult supervision during wiring, power-on, and movement tests.

## Compatibility gates

The recipe must not be labelled purchase-ready until all gates below have evidence.

1. Measure the selected chassis and choose the smallest carrying surface that fits without blocking wheels, wiring, or the power-off control.
2. Confirm the wheels fit the BO motor shafts and the caster leaves the chassis level.
3. Measure the complete robot mass separately from the 100 g carried load.
4. With the robot lifted so the wheels are clear, confirm forward, left, right, stop, and automatic timeout before a floor test.
5. On a flat floor with no load, run ten command cycles and confirm every command stops.
6. Add a 100 g centred load and repeat ten command cycles.
7. Record whether the robot starts, turns, stops, remains stable, and keeps the load in place.
8. After the test, have an adult check the motor driver, batteries, motors, and wires for unexpected heat, smell, looseness, or damage.
9. Reject or revise the recipe if voice disconnect, an unrecognised command, or loss of phone control can leave the motors running.

## Safe command behaviour

- `forward`, `left`, and `right` must cause a short timed movement, then stop automatically.
- `stop` must stop both motors immediately when received.
- Unknown words must cause no movement.
- Bluetooth disconnect must not start movement and must not leave a previous command running.
- A physical power-off control must remain reachable while the robot carries the test load.

## What V2 will not claim

- It will not claim support above 100 g.
- It will not claim a fixed platform size before the chassis is measured.
- It will not claim operation on carpet, slopes, thresholds, stairs, or wet floors.
- It will not include obstacle avoidance, mapping, automatic navigation, lifting, person following, or autonomous delivery.
- It will not call this recipe validated until the physical command and 100 g load tests are recorded.

## Current conclusion

The current animaloid recipe provides a plausible reusable electronic and 2WD mechanical core. That is an inference from the catalogue, not proof that the finished helper can safely carry 100 g. The carrying surface, physical power-off control, chassis measurements, and complete load test remain open.

## Next single action

Measure or obtain the exact dimensions and mounting layout of the intended MECH-001 2WD chassis, then select the smallest carrying surface that fits it.
