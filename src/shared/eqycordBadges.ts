/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const badgeUsers = new Set(["380070146317877249", "1306071807815712828"]);

export const eqycordBadgeDefinitions = Object.freeze([
    { id: "eqycord_staff", description: "EqyCord Staff", asset: "staff" },
    { id: "eqycord_creator", description: "EqyCord Creator", asset: "creator" }
] as const);

export function hasEqyCordBadges(userId: string): boolean {
    return badgeUsers.has(userId);
}
