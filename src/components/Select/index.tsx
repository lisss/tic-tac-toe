import React from 'react';
import './styles.css';

interface SelectProps<T> {
    value: T;
    options: T[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = <T extends string>({ value, options, onChange }: SelectProps<T>) => {
    return (
        <div className="select-item">
            <select className="select" {...{ value, onChange }}>
                {options.map(x => (
                    <option key={x}>{x}</option>
                ))}
            </select>
        </div>
    );
};
