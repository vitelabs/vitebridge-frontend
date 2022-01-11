import React, { useState } from 'react';
import { State } from './types';

// https://stackoverflow.com/a/51365037/13442719
type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object
		? RecursivePartial<T[P]>
		: T[P];
};

export type setStateType = (state: RecursivePartial<State>, meta?: { deepMerge?: boolean }) => void;

type HOCProps = {
	state: object;
	setState: setStateType;
};

// https://stackoverflow.com/a/58405003/13442719
const GlobalContext = React.createContext<HOCProps>(undefined!);

type ProviderProps = {
	children: React.ReactNode;
	initialState?: object;
	onSetState?: setStateType;
};

export const Provider = ({ children, initialState, onSetState }: ProviderProps) => {
	const [state, setState] = useState({ ...(initialState || {}) });

	return (
		<GlobalContext.Provider
			value={{
				state,
				setState: (stateChanges: object, options: { deepMerge?: boolean } = {}) => {
					setState((prevState) => {
						const newState = options.deepMerge
							? deepMerge({ ...prevState }, stateChanges)
							: { ...prevState, ...stateChanges };
						onSetState && onSetState(newState, options);
						return newState;
					});
				},
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};

export const deepMerge = (target: { [key: string]: any }, source: { [key: string]: any }) => {
	if (target && source) {
		for (const key in source) {
			if (
				source[key] instanceof Object &&
				!Array.isArray(source[key]) // NB: DOES NOT DEEP MERGE ARRAYS
			) {
				Object.assign(source[key], deepMerge(target[key] || {}, source[key]));
			}
		}
		Object.assign(target, source);
		return target;
	}
	return target || source;
};

export const connect = (keys?: string | null) => {
	const mapStateToProps = (dict: object) => {
		switch (keys) {
			case undefined:
				return dict;
			case null:
				return {};
			default:
				// eslint-disable-next-line
				return eval(`({${keys}}) => ({${keys}})`)(dict);
		}
	};

	// https://stackoverflow.com/a/56989122/13442719
	return <T,>(Component: React.ComponentType<T>) =>
		(props: any) =>
			(
				<GlobalContext.Consumer>
					{(value: { state: object; setState: setStateType }) => (
						<Component {...props} {...mapStateToProps(value.state)} setState={value.setState} />
					)}
				</GlobalContext.Consumer>
			);
};
