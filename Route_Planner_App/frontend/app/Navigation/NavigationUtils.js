import { getDistance } from 'geolib';

export const getCurrentInstruction = (location, routeCoordinates, instructions) => {
    console.log('Getting current instruction with:', {
        location,
        routeCoordinates,
        instructions,
      });
    if (!location || !routeCoordinates || !instructions || instructions.length === 0) {
        return null;
    }

    // Find the closest point on the route to current location
    let minDistance = Infinity;
    let closestPointIndex = 0;

    for (let i = 0; i < routeCoordinates.length; i++) {
        const distance = getDistance(
            { latitude: location.coords.latitude, longitude: location.coords.longitude },
            routeCoordinates[i]
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestPointIndex = i;
        }
    }

    // Find which instruction this point belongs to
    let currentInstructionIndex = -1;
    for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        if (!instruction.interval || instruction.interval.length !== 2) continue;

        const [startIndex, endIndex] = instruction.interval;

        // Check if our closest point falls within this instruction's interval
        if (closestPointIndex >= startIndex && closestPointIndex <= endIndex) {
            currentInstructionIndex = i;
            break;
        }
    }

    // If we haven't found an instruction but we're near the start, use the first instruction
    if (currentInstructionIndex === -1 && closestPointIndex < instructions[0]?.interval?.[1]) {
        currentInstructionIndex = 0;
    }

    // If we're beyond the last instruction's end point, use the last instruction
    if (currentInstructionIndex === -1 && closestPointIndex >= instructions[instructions.length - 1]?.interval?.[0]) {
        currentInstructionIndex = instructions.length - 1;
    }

    // If we still haven't found an instruction, look for the next upcoming one
    if (currentInstructionIndex === -1) {
        for (let i = 0; i < instructions.length; i++) {
            if (instructions[i].interval[0] > closestPointIndex) {
                currentInstructionIndex = i;
                break;
            }
        }
    }

    // If we still don't have an instruction, default to the first one
    if (currentInstructionIndex === -1) {
        currentInstructionIndex = 0;
    }

    // Format the instruction with distance information
    const instruction = instructions[currentInstructionIndex];
    if (!instruction) return null;

    const nextWaypointIndex = instruction.interval[1];
    const nextWaypoint = routeCoordinates[nextWaypointIndex];
    const isLast = currentInstructionIndex === instructions.length - 1;

    // Calculate distance to next turn
    const distanceToTurn = getDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        nextWaypoint
    );
    if (!instruction) {
        console.error('No instruction found for current location.');
        return null;
      }
    
      const formattedInstruction = formatNavigationInstruction(
        instruction,
        distanceToTurn,
        isLast
      );
    
      console.log('Formatted Instruction:', formattedInstruction);

    return {
        instruction: formatNavigationInstruction(
            instruction,
            distanceToTurn,
            isLast
        ),
        currentInstructionIndex
    };
};

export const formatNavigationInstruction = (instruction, distanceToTurn, isLastInstruction) => {
    if (!instruction) return null;

    // If it's the last instruction, return a custom message
    if (isLastInstruction) {
        return {
            text: "Arrive at your destination",
            streetName: instruction.streetName
        };
    }

    // Don't show distance prompts for "continue straight" instructions
    if (instruction.text.toLowerCase().includes('continue')) {
        return {
            text: instruction.text,
            streetName: instruction.streetName
        };
    }

    // Format distance-based instructions for turns
    if (distanceToTurn <= 100) {
        let formattedText = instruction.text;

        // Remove any existing distance references
        formattedText = formattedText.replace(/in \d+ meters,?/i, '').trim();

        if (distanceToTurn > 20) {
            return {
                text: `In ${Math.round(distanceToTurn / 10) * 10}m, ${formattedText}`,
                streetName: instruction.streetName
            };
        } else if (distanceToTurn > 10) {
            return {
                text: `In 20m, ${formattedText}`,
                streetName: instruction.streetName
            };
        } else {
            return {
                text: formattedText,
                streetName: instruction.streetName
            };
        }
    }

    return {
        text: instruction.text,
        streetName: instruction.streetName
    };
};

export const isLastInstruction = (currentInstructionIndex, instructions) => {
    return currentInstructionIndex === instructions.length - 1;
};