/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { eqycordBadgeDefinitions, hasEqyCordBadges } from "@shared/eqycordBadges";
import creatorIcon from "file://../assets/eqycord-badges/creator.svg?base64";
import staffIcon from "file://../assets/eqycord-badges/staff.svg?base64";

import type { ProfileBadge } from "./Badges";

const icons = { staff: staffIcon, creator: creatorIcon };

// Bundled assignments are visible to every client running this EqyCord build.
export const eqycordProfileBadges: ProfileBadge[] = eqycordBadgeDefinitions.map(badge => ({
    id: badge.id,
    description: badge.description,
    iconSrc: `data:image/svg+xml;base64,${icons[badge.asset]}`,
    shouldShow: ({ userId }) => hasEqyCordBadges(userId)
}));
