import { useEffect, useRef } from 'react';
/**
 * Stores the last known value during every render.
 * @param value The value to store.
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
