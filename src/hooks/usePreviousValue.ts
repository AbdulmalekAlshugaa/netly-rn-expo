import { useEffect, useRef } from 'react';
/**
 * Stores the last known value during every render.
 *
 * @param value Primitive variable to be stored as the "previous value" upon the next render.
 * @returns The last known value.
 */
const usePreviousValue = <T extends {}>(value: T): T | undefined => {
	const ref = useRef<T>(undefined as unknown as T);

	useEffect(() => {
		ref.current = value;
	});

	return ref.current;
};

export default usePreviousValue;
