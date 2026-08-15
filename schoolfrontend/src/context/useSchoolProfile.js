import { useContext } from 'react';
import { SchoolProfileContext } from './SchoolProfileContext';

export function useSchoolProfile() {
    return useContext(SchoolProfileContext);
}