export function isCurrentTerm(t) {
    return t?.isCurrent === true || t?.current === true;
}