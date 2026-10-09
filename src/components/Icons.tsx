/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./iconStyles.css";

import { getIntlMessage } from "@utils/discord";
import { classes } from "@utils/misc";
import type { JSX, PropsWithChildren } from "react";

interface BaseIconProps extends IconProps {
    viewBox: string;
}

type IconProps = JSX.IntrinsicElements["svg"];

export const DiscordIconSizes = {
    xxs: 12,
    xs: 16,
    sm: 18,
    md: 24,
    lg: 32,
    refresh_sm: 20
} as const;

function Icon({ height = 24, width = 24, className, children, viewBox, ...svgProps }: PropsWithChildren<BaseIconProps>) {
    return (
        <svg
            className={classes(className, "vc-icon")}
            role="img"
            width={width}
            height={height}
            viewBox={viewBox}
            {...svgProps}
        >
            {children}
        </svg>
    );
}

/**
 * Discord's link icon, as seen in the Message context menu "Copy Message Link" option
 */
export function LinkIcon({ height = 24, width = 24, className }: IconProps) {
    return (
        <Icon
            height={height}
            width={width}
            className={classes(className, "vc-link-icon")}
            viewBox="0 0 24 24"
        >
            <g fill="none" fillRule="evenodd">
                <path fill="currentColor" d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z" />
                <rect width={width} height={height} />
            </g>
        </Icon>
    );
}

/**
 * Discord's copy icon, as seen in the user panel popout on the right of the username and in large code blocks
 */
export function CopyIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-copy-icon")}
            viewBox="0 0 24 24"
        >
            <g fill="currentColor">
                <path d="M3 16a1 1 0 0 1-1-1v-5a8 8 0 0 1 8-8h5a1 1 0 0 1 1 1v.5a.5.5 0 0 1-.5.5H10a6 6 0 0 0-6 6v5.5a.5.5 0 0 1-.5.5H3Z" />
                <path d="M6 18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4h-3a5 5 0 0 1-5-5V6h-4a4 4 0 0 0-4 4v8Z" />
                <path d="M21.73 12a3 3 0 0 0-.6-.88l-4.25-4.24a3 3 0 0 0-.88-.61V9a3 3 0 0 0 3 3h2.73Z" />
            </g>
        </Icon>
    );
}

/**
 * Discord's ID icon, as seen in Developer Mode "Copy ID" context menu items
 */
export function CopyIdIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-copy-id-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M15.3 14.48c-.46.45-1.08.67-1.86.67h-1.39V9.2h1.39c.78 0 1.4.22 1.86.67.46.45.68 1.22.68 2.31 0 1.1-.22 1.86-.68 2.31Z"
            />
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm1 15h2.04V7.34H6V17Zm4-9.66V17h3.44c1.46 0 2.6-.42 3.38-1.25.8-.83 1.2-2.02 1.2-3.58s-.4-2.75-1.2-3.58c-.79-.83-1.92-1.25-3.38-1.25H10Z"
            />
        </Icon>
    );
}

/**
 * Discord's open external icon, as seen in the user profile connections
 */
export function OpenExternalIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-open-external-icon")}
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M15 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V4.41l-4.3 4.3a1 1 0 1 1-1.4-1.42L19.58 3H16a1 1 0 0 1-1-1Z" />
            <path fill="currentColor" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 1 0-2 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 1 0 0-2H5Z" />
        </Icon>
    );
}

export function ImageIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-image-icon")}
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M21,19V5c0,-1.1 -0.9,-2 -2,-2H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2zM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5,-4.5z" />
        </Icon>
    );
}

export function InfoIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-info-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0Zm-9.5-4.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm-.77 3.96a1 1 0 1 0-1.96-.42l-1.04 4.86a2.77 2.77 0 0 0 4.31 2.83l.24-.17a1 1 0 1 0-1.16-1.62l-.24.17a.77.77 0 0 1-1.2-.79l1.05-4.86Z" clipRule="evenodd"
            />
        </Icon>
    );
}

export function WarningIcon({ height = 32, width = 32, className }: IconProps) {
    return (
        <Icon
            height={height}
            width={width}
            className={classes(className, "vc-warning-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M10 3.1a2.37 2.37 0 0 1 4 0l8.71 14.75c.84 1.41-.26 3.15-2 3.15H3.29c-1.74 0-2.84-1.74-2-3.15L9.99 3.1Zm3.25 14.65a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM13.06 14l.37-5.94a1 1 0 0 0-1-1.06h-.87a1 1 0 0 0-1 1.06l.38 5.94a1.06 1.06 0 0 0 2.12 0Z"
            />
        </Icon>
    );
}

export function OwnerCrownIcon(props: IconProps) {
    return (
        <Icon
            aria-label={getIntlMessage("GUILD_OWNER")}
            {...props}
            className={classes(props.className, "vc-owner-crown-icon")}
            role="img"
            viewBox="0 0 16 16"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.6572 5.42868C13.8879 5.29002 14.1806 5.30402 14.3973 5.46468C14.6133 5.62602 14.7119 5.90068 14.6473 6.16202L13.3139 11.4954C13.2393 11.7927 12.9726 12.0007 12.6666 12.0007H3.33325C3.02725 12.0007 2.76058 11.792 2.68592 11.4954L1.35258 6.16202C1.28792 5.90068 1.38658 5.62602 1.60258 5.46468C1.81992 5.30468 2.11192 5.29068 2.34325 5.42868L5.13192 7.10202L7.44592 3.63068C7.46173 3.60697 7.48377 3.5913 7.50588 3.57559C7.5192 3.56612 7.53255 3.55663 7.54458 3.54535L6.90258 2.90268C6.77325 2.77335 6.77325 2.56068 6.90258 2.43135L7.76458 1.56935C7.89392 1.44002 8.10658 1.44002 8.23592 1.56935L9.09792 2.43135C9.22725 2.56068 9.22725 2.77335 9.09792 2.90268L8.45592 3.54535C8.46794 3.55686 8.48154 3.56651 8.49516 3.57618C8.51703 3.5917 8.53897 3.60727 8.55458 3.63068L10.8686 7.10202L13.6572 5.42868ZM2.66667 12.6673H13.3333V14.0007H2.66667V12.6673Z"
            />
        </Icon>
    );
}

/**
 * Discord's screenshare icon, as seen in the connection panel
 */
export function ScreenshareIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-screenshare-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M2 4.5C2 3.397 2.897 2.5 4 2.5H20C21.103 2.5 22 3.397 22 4.5V15.5C22 16.604 21.103 17.5 20 17.5H13V19.5H17V21.5H7V19.5H11V17.5H4C2.897 17.5 2 16.604 2 15.5V4.5ZM13.2 14.3375V11.6C9.864 11.6 7.668 12.6625 6 15C6.672 11.6625 8.532 8.3375 13.2 7.6625V5L18 9.6625L13.2 14.3375Z"
            />
        </Icon>
    );
}

export function ImageVisible(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-image-visible")}
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm1-2h12l-3.75-5-3 4L9 13Zm-1 2V5v14Z" />
        </Icon>
    );
}

export function ImageInvisible(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-image-invisible")}
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="m21 18.15-2-2V5H7.85l-2-2H19q.825 0 1.413.587Q21 4.175 21 5Zm-1.2 4.45L18.2 21H5q-.825 0-1.413-.587Q3 19.825 3 19V5.8L1.4 4.2l1.4-1.4 18.4 18.4ZM6 17l3-4 2.25 3 .825-1.1L5 7.825V19h11.175l-2-2Zm7.425-6.425ZM10.6 13.4Z" />
        </Icon>
    );
}

export function Microphone(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-microphone")}
            viewBox="0 0 24 24"
        >
            <path fillRule="evenodd" clipRule="evenodd" d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V21H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1ZM12 4C11.2 4 11 4.66667 11 5V11C11 11.3333 11.2 12 12 12C12.8 12 13 11.3333 13 11V5C13 4.66667 12.8 4 12 4Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V22H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1Z" fill="currentColor" />
        </Icon >
    );
}

export function CogWheel(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-cog-wheel")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                clipRule="evenodd"
            />
        </Icon>
    );
}

export function ReplyIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-reply-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z"
            />
        </Icon>
    );
}

export function DeleteIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-delete-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"
            />
            <path
                fill="currentColor"
                d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"
            />
        </Icon>
    );
}

/**
 * A plugin icon, created by CorellanStoma. https://github.com/CreArts-Community/Settings-Icons
 */
export function PluginIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-plugin-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"
            />
        </Icon>
    );
}

export function PlusIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-plus-icon")}
            viewBox="0 0 18 18"
        >
            <polygon
                fillRule="nonzero"
                fill="currentColor"
                points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"
            />
        </Icon>
    );
}

export function NoEntrySignIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-no-entry-sign-icon")}
            viewBox="0 0 24 24"
        >
            <path
                d="M0 0h24v24H0z"
                fill="none"
            />
            <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"
            />
        </Icon>
    );
}

export function PasteIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-paste-icon")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </Icon>
    );
}

export function ResetIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </Icon>
    );
}

export function SafetyIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-safety-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.27 5.22A2.66 2.66 0 0 0 3 7.5v2.3c0 5.6 3.3 10.68 8.42 12.95.37.17.79.17 1.16 0A14.18 14.18 0 0 0 21 9.78V7.5c0-.93-.48-1.78-1.27-2.27l-6.17-3.76a3 3 0 0 0-3.12 0L4.27 5.22ZM6 7.68l6-3.66V12H6.22C6.08 11.28 6 10.54 6 9.78v-2.1Zm6 12.01V12h5.78A11.19 11.19 0 0 1 12 19.7Z"
            />
        </Icon>

    );
}

export function NotesIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-notes-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M8 3C7.44771 3 7 3.44772 7 4V5C7 5.55228 7.44772 6 8 6H16C16.5523 6 17 5.55228 17 5V4C17 3.44772 16.5523 3 16 3H15.1245C14.7288 3 14.3535 2.82424 14.1002 2.52025L13.3668 1.64018C13.0288 1.23454 12.528 1 12 1C11.472 1 10.9712 1.23454 10.6332 1.64018L9.8998 2.52025C9.64647 2.82424 9.27121 3 8.8755 3H8Z"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill="currentColor"
                d="M19 4.49996V4.99996C19 6.65681 17.6569 7.99996 16 7.99996H8C6.34315 7.99996 5 6.65681 5 4.99996V4.49996C5 4.22382 4.77446 3.99559 4.50209 4.04109C3.08221 4.27826 2 5.51273 2 6.99996V19C2 20.6568 3.34315 22 5 22H19C20.6569 22 22 20.6568 22 19V6.99996C22 5.51273 20.9178 4.27826 19.4979 4.04109C19.2255 3.99559 19 4.22382 19 4.49996ZM8 12C7.44772 12 7 12.4477 7 13C7 13.5522 7.44772 14 8 14H16C16.5523 14 17 13.5522 17 13C17 12.4477 16.5523 12 16 12H8ZM7 17C7 16.4477 7.44772 16 8 16H13C13.5523 16 14 16.4477 14 17C14 17.5522 13.5523 18 13 18H8C7.44772 18 7 17.5522 7 17Z"
            />
        </Icon>
    );
}

export function IDIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-id-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M15.3 14.48c-.46.45-1.08.67-1.86.67h-1.39V9.2h1.39c.78 0 1.4.22 1.86.67.46.45.68 1.22.68 2.31 0 1.1-.22 1.86-.68 2.31Z"
            />
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm1 15h2.04V7.34H6V17Zm4-9.66V17h3.44c1.46 0 2.6-.42 3.38-1.25.8-.83 1.2-2.02 1.2-3.58s-.4-2.75-1.2-3.58c-.79-.83-1.92-1.25-3.38-1.25H10Z"
                clipRule="evenodd"
            />
        </Icon>
    );
}

export function FolderIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-folder-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M2 5a3 3 0 0 1 3-3h3.93a2 2 0 0 1 1.66.9L12 5h7a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5Z"
            />
        </Icon>
    );
}

export function LogIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-log-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.11 8H6v10.82c0 .86.37 1.68 1 2.27.46.43 1.02.71 1.63.84A1 1 0 0 0 9 22h10a4 4 0 0 0 4-4v-1a2 2 0 0 0-2-2h-1V5a3 3 0 0 0-3-3H4.67c-.87 0-1.7.32-2.34.9-.63.6-1 1.42-1 2.28 0 .71.3 1.35.52 1.75a5.35 5.35 0 0 0 .48.7l.01.01h.01L3.11 7l-.76.65a1 1 0 0 0 .76.35Zm1.56-4c-.38 0-.72.14-.97.37-.24.23-.37.52-.37.81a1.69 1.69 0 0 0 .3.82H6v-.83c0-.29-.13-.58-.37-.8C5.4 4.14 5.04 4 4.67 4Zm5 13a3.58 3.58 0 0 1 0 3H19a2 2 0 0 0 2-2v-1H9.66ZM3.86 6.35ZM11 8a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5Zm-1 5a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2h-5a1 1 0 0 1-1-1Z"
            />
        </Icon>
    );
}

export function RestartIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-restart-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M4 12a8 8 0 0 1 14.93-4H15a1 1 0 1 0 0 2h6a1 1 0 0 0 1-1V3a1 1 0 1 0-2 0v3a9.98 9.98 0 0 0-18 6 10 10 0 0 0 16.29 7.78 1 1 0 0 0-1.26-1.56A8 8 0 0 1 4 12Z"
            />
        </Icon>
    );
}

export function PaintbrushIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-paintbrush-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.35 7.24C15.9 6.67 16 5.8 16 5a3 3 0 1 1 3 3c-.8 0-1.67.09-2.24.65a1.5 1.5 0 0 0 0 2.11l1.12 1.12a3 3 0 0 1 0 4.24l-5 5a3 3 0 0 1-4.25 0l-5.76-5.75a3 3 0 0 1 0-4.24l4.04-4.04.97-.97a3 3 0 0 1 4.24 0l1.12 1.12c.58.58 1.52.58 2.1 0ZM6.9 9.9 4.3 12.54a1 1 0 0 0 0 1.42l2.17 2.17.83-.84a1 1 0 0 1 1.42 1.42l-.84.83.59.59 1.83-1.84a1 1 0 0 1 1.42 1.42l-1.84 1.83.17.17a1 1 0 0 0 1.42 0l2.63-2.62L6.9 9.9Z"
            />
        </Icon>
    );
}

export function PencilIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            className={classes(props.className, "vc-pencil-icon")}
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z"
            />
        </Icon>
    );
}

export function GithubIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="-3 -3 30 30"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.17c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.42-1.305.763-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.398 3-.403 1.02.005 2.043.137 3 .403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.803 5.625-5.475 5.92.43.37.823 1.102.823 2.222v3.293c0 .32.218.694.825.577C20.565 21.797 24 17.298 24 12c0-6.63-5.37-12-12-12z"
            />
        </Icon>
    );
}

export function WebsiteIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM4 12c0-.899.156-1.762.431-2.569L6 11l2 2v2l2 2 1 1v1.931C7.061 19.436 4 16.072 4 12zm14.33 4.873C17.677 16.347 16.687 16 16 16v-1a2 2 0 0 0-2-2h-4v-3a2 2 0 0 0 2-2V7h1a2 2 0 0 0 2-2v-.411C17.928 5.778 20 8.65 20 12a7.947 7.947 0 0 1-1.67 4.873z"
            />
        </Icon>
    );
}

/**
 * A question mark inside a square, used as a placeholder icon when no other icon is available
 */
export function PlaceholderIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path fill={props.fill || "currentColor"} fillRule="evenodd" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm6.81 7c-.54 0-1 .26-1.23.61A1 1 0 0 1 8.92 8.5 3.49 3.49 0 0 1 11.82 7c1.81 0 3.43 1.38 3.43 3.25 0 1.45-.98 2.61-2.27 3.06a1 1 0 0 1-1.96.37l-.19-1a1 1 0 0 1 .98-1.18c.87 0 1.44-.63 1.44-1.25S12.68 9 11.81 9ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7-10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM5.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
        </Icon>
    );
}

export function MainSettingsIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
            />
        </Icon>
    );
}

export function PluginsIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M18.559 12.8227C17.7884 13.4957 16.6663 13.3616 15.9404 12.641C14.7975 11.5063 11.4931 8.21104 11.4931 8.21104C10.897 7.63087 10.897 6.44662 11.4931 5.85464C12.319 5.03435 13.6053 3.75146 13.6053 3.75146C13.9641 3.39195 14.456 3.18972 14.9653 3.18886L18.3363 3.18425L19.5255 2L22.5 4.96048L21.3108 6.14473L21.3021 9.50878C21.2992 10.0164 21.0967 10.5026 20.735 10.8613C20.735 10.8613 19.5718 11.9384 18.559 12.8227ZM15.2315 13.9548L13.4954 15.8273C14.0972 16.4265 14.0972 16.9113 13.64 17.6997L11.3976 20.2485C11.0359 20.6081 10.5469 20.8103 10.0347 20.8111L6.66378 20.8158L5.47455 22L2.5 19.0395L3.68927 17.8553L3.70082 14.4912C3.70082 13.9836 3.90338 13.4974 4.26507 13.1387L6.37153 11.0404C6.96759 10.4485 8.15685 10.4485 8.73844 11.0404L8.74424 11.0465L10.5295 9.26998L11.7188 10.4542L9.93347 12.2305L12.3119 14.599L14.0972 12.8227L15.2315 13.9548Z"
            />
        </Icon>
    );
}

export function CloudIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M16.8333 19H5.16667C3.16667 19 1.5 17.3333 1.5 15.3333C1.5 13.4 2.96667 11.8667 4.83333 11.6667V11.3333C4.83333 7.86667 7.7 5 11.1667 5C14.0333 5 16.5667 6.93333 17.3 9.66667C19.7 9.86667 21.5 11.8667 21.5 14.3333C21.5 16.9333 19.4333 19 16.8333 19Z"
            />
        </Icon>
    );
}

export function BackupRestoreIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M21 2.01232C21.2652 2.01232 21.5196 2.11757 21.7071 2.30492C21.8946 2.49226 22 2.74636 22 3.0113V9.00521C22 9.27015 21.8946 9.52425 21.7071 9.7116C21.5196 9.89894 21.2652 10.0042 21 10.0042H15C14.7348 10.0042 14.4804 9.89894 14.2929 9.7116C14.1054 9.52425 14 9.27015 14 9.00521C14 8.74026 14.1054 8.48617 14.2929 8.29882C14.4804 8.11147 14.7348 8.00622 15 8.00622H18.93C18.352 7.00597 17.5638 6.14275 16.6198 5.47602C15.6758 4.80929 14.5983 4.35488 13.4616 4.1441C12.3249 3.93332 11.1559 3.97117 10.0353 4.25505C8.91459 4.53892 7.86883 5.06208 6.97 5.78848C6.76313 5.9554 6.49836 6.03338 6.23393 6.00528C5.96951 5.97718 5.72709 5.84529 5.56 5.63863C5.39291 5.43197 5.31485 5.16747 5.34298 4.90331C5.37111 4.63916 5.50313 4.39698 5.71 4.23006C6.7542 3.38308 7.959 2.7557 9.25204 2.38561C10.5451 2.01552 11.8996 1.91037 13.2344 2.07646C14.5691 2.24255 15.8565 2.67646 17.0191 3.35212C18.1818 4.02778 19.1957 4.93125 20 6.00826V3.0113C20 2.74636 20.1054 2.49226 20.2929 2.30492C20.4804 2.11757 20.7348 2.01232 21 2.01232ZM3 21.992C2.73478 21.992 2.48043 21.8867 2.29289 21.6994C2.10536 21.5121 2 21.258 2 20.993V14.9991C2 14.7342 2.10536 14.4801 2.29289 14.2927C2.48043 14.1054 2.73478 14.0001 3 14.0001H9C9.26522 14.0001 9.51957 14.1054 9.70711 14.2927C9.89464 14.4801 10 14.7342 10 14.9991C10 15.2641 9.89464 15.5182 9.70711 15.7055C9.51957 15.8928 9.26522 15.9981 9 15.9981H5.07C5.64801 16.9983 6.43617 17.8616 7.3802 18.5283C8.32424 19.195 9.40171 19.6494 10.5384 19.8602C11.6751 20.071 12.8441 20.0331 13.9647 19.7493C15.0854 19.4654 16.1312 18.9422 17.03 18.2158C17.1324 18.1332 17.2502 18.0715 17.3764 18.0343C17.5027 17.9971 17.6351 17.9851 17.7661 17.999C17.897 18.013 18.0239 18.0525 18.1395 18.1154C18.2552 18.1783 18.3573 18.2634 18.44 18.3657C18.5227 18.468 18.5845 18.5856 18.6217 18.7118C18.659 18.8379 18.6709 18.9702 18.657 19.101C18.6431 19.2318 18.6035 19.3586 18.5405 19.4741C18.4776 19.5896 18.3924 19.6916 18.29 19.7743C17.2452 20.6199 16.0403 21.2461 14.7475 21.6154C13.4547 21.9847 12.1005 22.0895 10.7662 21.9235C9.43181 21.7574 8.14476 21.324 6.98212 20.6491C5.81947 19.9743 4.80518 19.0719 4 17.9961V20.993C4 21.258 3.89464 21.5121 3.70711 21.6994C3.51957 21.8867 3.26522 21.992 3 21.992Z"
            />
        </Icon>
    );
}

export function UpdaterIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M12 2C12.2652 2 12.5196 2.10536 12.7071 2.29289C12.8946 2.48043 13 2.73478 13 3V13.59L16.3 10.29C16.3904 10.186 16.5013 10.1018 16.6258 10.0427C16.7503 9.98362 16.8856 9.95088 17.0234 9.94656C17.1611 9.94224 17.2982 9.96644 17.4261 10.0176C17.5541 10.0688 17.6701 10.1459 17.7668 10.244C17.8635 10.3421 17.939 10.4592 17.9883 10.5878C18.0377 10.7165 18.0599 10.8539 18.0537 10.9916C18.0474 11.1292 18.0127 11.2641 17.9519 11.3877C17.891 11.5114 17.8053 11.6211 17.7 11.71L12.7 16.71C12.5131 16.8932 12.2618 16.9959 12 16.9959C11.7382 16.9959 11.4869 16.8932 11.3 16.71L6.3 11.71C6.19474 11.6211 6.10898 11.5114 6.04812 11.3877C5.98726 11.2641 5.95261 11.1292 5.94634 10.9916C5.94007 10.8539 5.96231 10.7165 6.01167 10.5878C6.06104 10.4592 6.13646 10.3421 6.2332 10.244C6.32994 10.1459 6.44592 10.0688 6.57385 10.0176C6.70179 9.96644 6.83892 9.94224 6.97665 9.94656C7.11438 9.95088 7.24972 9.98362 7.3742 10.0427C7.49868 10.1018 7.6096 10.186 7.7 10.29L11 13.59V3C11 2.73478 11.1054 2.48043 11.2929 2.29289C11.4804 2.10536 11.7348 2 12 2ZM3 20C2.73478 20 2.48043 20.1054 2.29289 20.2929C2.10536 20.4804 2 20.7348 2 21C2 21.2652 2.10536 21.5196 2.29289 21.7071C2.48043 21.8946 2.73478 22 3 22H21C21.2652 22 21.5196 21.8946 21.7071 21.7071C21.8946 21.5196 22 21.2652 22 21C22 20.7348 21.8946 20.4804 21.7071 20.2929C21.5196 20.1054 21.2652 20 21 20H3Z"
            />
        </Icon>
    );
}

export function PatchHelperIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M7.79997 15.7699C8.49996 16.1999 8.99997 16.9099 8.99997 17.7299V20.9999C8.99997 21.2651 9.10533 21.5195 9.29286 21.707C9.48039 21.8945 9.73476 21.9999 9.99996 21.9999H14C14.2652 21.9999 14.5196 21.8945 14.7071 21.707C14.8946 21.5195 15 21.2651 15 20.9999V17.7299C15 16.9099 15.5 16.1999 16.2 15.7699C17.357 15.0536 18.3137 14.056 18.9812 12.8701C19.6486 11.6842 20.0048 10.3487 20.0168 8.98795C20.0288 7.62724 19.6961 6.28564 19.0497 5.08819C18.4032 3.89074 17.4642 2.87647 16.32 2.13989C15.72 1.74989 15 2.22989 15 2.93989V8.91988C15 9.18511 14.8946 9.43945 14.7071 9.62701C14.5196 9.81454 14.2652 9.9199 14 9.9199H9.99996C9.73476 9.9199 9.48039 9.81454 9.29286 9.62701C9.10533 9.43945 8.99997 9.18511 8.99997 8.91988V2.93989C8.99997 2.22989 8.27997 1.74989 7.67997 2.13989C6.53577 2.87647 5.59671 3.89074 4.9503 5.08819C4.30386 6.28564 3.97113 7.62724 3.9831 8.98795C3.9951 10.3487 4.35138 11.6842 5.01879 12.8701C5.6862 14.056 6.64299 15.0536 7.79997 15.7699Z"
            />
        </Icon>
    );
}

export function VesktopSettingsIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M18.157.056a1.224 1.224 0 0 0-.709.628c-.105.229-.114.305-.115 1.081v.836l-.351.176a5.545 5.545 0 0 0-.586.342l-.233.167-.543-.311c-.899-.515-.944-.535-1.293-.539-.562-.004-1.018.352-1.17.917-.07.262-.021.567.138.858.151.28.21.325 1.02.794l.606.35v1.38l-.606.35c-.81.469-.869.514-1.02.793-.16.291-.208.597-.137.859.151.564.607.92 1.17.916.347-.004.393-.023 1.289-.537l.54-.308.313.21c.172.116.438.262.588.325l.275.114v.85c.001.793.009.87.115 1.098a1.19 1.19 0 0 0 1.969.282c.269-.307.292-.412.292-1.37v-.869l.315-.148c.173-.081.435-.228.582-.325l.266-.177.706.4c.796.45 1.029.523 1.408.438.882-.198 1.235-1.287.635-1.96-.085-.097-.457-.348-.827-.56l-.67-.385V5.359l.67-.386c.37-.212.742-.463.827-.56.6-.672.247-1.762-.635-1.96-.38-.084-.612-.012-1.405.437l-.7.397-.235-.18a3.792 3.792 0 0 0-.586-.344l-.35-.163v-.848c0-.935-.023-1.044-.292-1.35a1.2 1.2 0 0 0-1.26-.346M4.007 1.25a4.15 4.15 0 0 0-1.21.44c-.354.207-1.102.955-1.309 1.309-.199.34-.374.837-.441 1.252-.07.434-.07 10.426 0 10.86.127.792.42 1.343 1.039 1.963.477.478.81.697 1.317.874.59.204.818.216 4.125.217h3.163v2.42l-1.975.014c-2.202.015-2.148.008-2.5.362-.255.253-.346.474-.346.84s.09.587.345.84c.376.376-.09.348 5.688.348 5.75 0 5.309.025 5.67-.327a1.1 1.1 0 0 0 .362-.86c.002-.367-.09-.586-.344-.84-.353-.355-.3-.348-2.5-.363l-1.976-.014v-2.42h3.164c3.306-.001 3.535-.013 4.124-.217.508-.177.84-.396 1.318-.874.882-.882 1.113-1.57 1.082-3.213-.018-.956-.047-1.068-.364-1.384-.253-.255-.474-.346-.84-.346s-.586.091-.84.346c-.317.316-.343.42-.372 1.47-.023.846-.036.966-.13 1.14a1.22 1.22 0 0 1-.597.553c-.217.098-.276.098-7.757.098-7.48 0-7.54 0-7.757-.098a1.153 1.153 0 0 1-.612-.602l-.114-.242V9.68c.001-5.041.003-5.119.1-5.333.122-.27.3-.462.553-.599.19-.103.242-.104 2.958-.128 3.08-.027 2.927-.01 3.288-.372.255-.254.345-.474.345-.84s-.09-.587-.345-.84c-.364-.365-.204-.347-3.288-.355-1.52-.004-2.881.012-3.024.036m15.047 3.693c.207.108.452.361.57.59.143.278.143.755 0 1.028-.285.54-1.08.81-1.636.556a1.357 1.357 0 0 1-.59-.625c-.107-.255-.092-.7.032-.956.121-.251.46-.568.69-.645.213-.073.755-.043.934.052"
            />
        </Icon>
    );
}

export function EyeIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M15.56 11.77c.2-.1.44.02.44.23a4 4 0 1 1-4-4c.21 0 .33.25.23.44a2.5 2.5 0 0 0 3.32 3.32Z"
            />
            <path
                clipRule="evenodd"
                fillRule="evenodd"
                fill={props.fill || "currentColor"}
                d="M22.89 11.7c.07.2.07.4 0 .6C22.27 13.9 19.1 21 12 21c-7.11 0-10.27-7.11-10.89-8.7a.83.83 0 0 1 0-.6C1.73 10.1 4.9 3 12 3c7.11 0 10.27 7.11 10.89 8.7Zm-4.5-3.62A15.11 15.11 0 0 1 20.85 12c-.38.88-1.18 2.47-2.46 3.92C16.87 17.62 14.8 19 12 19c-2.8 0-4.87-1.38-6.39-3.08A15.11 15.11 0 0 1 3.15 12c.38-.88 1.18-2.47 2.46-3.92C7.13 6.38 9.2 5 12 5c2.8 0 4.87 1.38 6.39 3.08Z"
            />
        </Icon>
    );
}

export function ColorPaletteIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M12.37 9.04c.25-.26.73-.2 1.06.13L15 10.7c.33.33.39.8.13 1.06L4.92 21.84c-.27.26-.74.2-1.07-.13l-1.56-1.54c-.33-.32-.39-.8-.13-1.05l10.2-10.08ZM16.09 5.16c.25-.26.73-.2 1.06.13l1.56 1.54c.33.32.39.8.13 1.05l-2.1 2.08c-.26.25-.74.2-1.07-.13l-1.56-1.54c-.33-.33-.38-.8-.13-1.05l2.1-2.08ZM17.48 14.36a.56.56 0 0 1 1.04 0l.85 2.27 2.27.85c.48.18.48.86 0 1.04l-2.27.85-.85 2.27a.56.56 0 0 1-1.04 0l-.85-2.27-2.27-.85a.56.56 0 0 1 0-1.04l2.27-.85.85-2.27ZM7.6 2.32a.5.5 0 0 1 .94 0L9.17 4l1.66.62a.5.5 0 0 1 0 .93l-1.66.63-.63 1.66a.5.5 0 0 1-.93 0l-.63-1.66-1.66-.63a.5.5 0 0 1 0-.93l1.66-.62.63-1.67Z"
            />
        </Icon>
    );
}

export function MagnifyingGlassIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                clipRule="evenodd"
                fillRule="evenodd"
                fill={props.fill || "currentColor"}
                d="M15.62 17.03a9 9 0 1 1 1.41-1.41l4.68 4.67a1 1 0 0 1-1.42 1.42l-4.67-4.68ZM17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
        </Icon>
    );
}

export function CloudDownloadIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.83 7.13 7.39 5.75 8.95 4.38 11 4.08V12.15L9.4 10.6L8 12L12 16L16 12L14.6 10.6L13 12.15V4.08Q15.58 4.43 17.29 6.39 19 8.35 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20Z"
            />
        </Icon>
    );
}

export function CloudUploadIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M11 20H6.5Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20H13V12.85L14.6 14.4L16 13L12 9L8 13L9.4 14.4L11 12.85Z"
            />
        </Icon>
    );
}

export function ClockIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={props.fill || "currentColor"}
                d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm1-18a1 1 0 1 0-2 0v7c0 .27.1.52.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.58V5Z"
            />
        </Icon>
    );
}

export function ChevronSmallDownIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
            />
        </Icon>
    );
}

export function ChevronSmallUpIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M5.3 14.7a1 1 0 0 0 1.4 0l5.3-5.29 5.3 5.3a1 1 0 1 0 1.4-1.42l-6-6a1 1 0 0 0-1.4 0l-6 6a1 1 0 0 0 0 1.42Z"
            />
        </Icon>
    );
}

export function ChevronSmallLeftIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M14.7 5.3a1 1 0 0 1 0 1.4L9.41 12l5.3 5.3a1 1 0 0 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
            />
        </Icon>
    );
}

export function ChevronSmallRightIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"
            />
        </Icon>
    );
}

export function DownArrow(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
            />
        </Icon>
    );
}

export function RightArrow(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"
            />
        </Icon>
    );
}

export const QrCodeIcon = (props?: any) => {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M4 6c0-1.1.9-2 2-2h3a1 1 0 0 0 0-2H6a4 4 0 0 0-4 4v3a1 1 0 0 0 2 0V6ZM4 18c0 1.1.9 2 2 2h3a1 1 0 1 1 0 2H6a4 4 0 0 1-4-4v-3a1 1 0 1 1 2 0v3ZM20 6a2 2 0 0 0-2-2h-3a1 1 0 1 1 0-2h3a4 4 0 0 1 4 4v3a1 1 0 1 1-2 0V6Z"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={props.fill || "currentColor"}
                d="M5 7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Zm2 0h2v2H7V7ZM5 15c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2Zm2 0h2v2H7v-2ZM13 7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7Zm2 0h2v2h-2V7ZM17.08 13a1.5 1.5 0 0 0-1.42 1.03c-.09.25-.3.47-.56.47H15a2 2 0 0 0-2 2V20c0 1.1.9 2 2 2h6a2 2 0 0 0 2-2v-3.5a2 2 0 0 0-2-2h-.1c-.26 0-.47-.22-.56-.47A1.5 1.5 0 0 0 18.92 13h-1.84ZM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
            />
        </Icon>
    );
};

export const ComponentsIcon = (props?: any) => {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M3 15.5V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v.5a.5.5 0 0 1-.5.5H17a4 4 0 0 0-4 4v4.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5ZM12.5 18H2a1 1 0 1 0 0 2h10.48c.33 0 .57-.3.54-.63A4.08 4.08 0 0 1 13 19v-.5a.5.5 0 0 0-.5-.5Z"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={props.fill || "currentColor"}
                d="M15 11c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8Zm2 1a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Z"
            />
        </Icon>
    );
};

export const LogsIcon = (props?: any) => {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={props.fill || "currentColor"}
                d="M21 21.93V2.07a1 1 0 0 0-1.27-.97l-2.5.7a3 3 0 0 1-1.46.04l-3.12-.7a3 3 0 0 0-1.3 0l-3.12.7a3 3 0 0 1-1.45-.04l-2.51-.7A1 1 0 0 0 3 2.07v19.86a1 1 0 0 0 1.27.97l2.5-.7a3 3 0 0 1 1.46-.04l3.12.7a3 3 0 0 0 1.3 0l3.12-.7a3 3 0 0 1 1.45.04l2.51.7a1 1 0 0 0 1.27-.97ZM7 8a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm1 3a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H8Zm-1 5a1 1 0 0 1 1-1h3a1 1 0 0 1 0 2H8a1 1 0 0 1-1-1Zm8-1a1 1 0 0 0 0 2h1a1 1 0 1 0 0-2h-1Z"
            />
        </Icon>
    );
};

export const BookmarkIcon = (props?: any) => {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v16a1 1 0 0 1-1.67.74l-5.66-5.13a1 1 0 0 0-1.34 0l-5.66 5.13A1 1 0 0 1 4 20.99V5Z"
            />
        </Icon>
    );
};

export function RobotIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                fill={props.fill || "currentColor"}
                d="M7.89 13.46a1 1 0 0 1-1.78-.9L7 13l-.9-.45.01-.01.01-.02a2.24 2.24 0 0 1 .14-.23c.1-.14.23-.31.4-.5.37-.36.98-.79 1.84-.79.86 0 1.47.43 1.83.8a3.28 3.28 0 0 1 .55.72v.02h.01v.01L10 13l.9-.45a1 1 0 0 1-1.79.9 1.28 1.28 0 0 0-.19-.25c-.14-.13-.28-.2-.42-.2-.14 0-.28.07-.42.2a1.28 1.28 0 0 0-.19.25ZM13.55 13.9a1 1 0 0 0 1.34-.44c0-.02.02-.04.04-.06.03-.05.08-.13.15-.2.14-.13.28-.2.42-.2.14 0 .28.07.42.2a1.28 1.28 0 0 1 .19.25 1 1 0 0 0 1.78-.9L17 13l.9-.45-.01-.01-.01-.02a2.1 2.1 0 0 0-.14-.23 3.28 3.28 0 0 0-.4-.5c-.37-.36-.98-.79-1.84-.79-.86 0-1.47.43-1.83.8a3.28 3.28 0 0 0-.55.72v.02h-.01v.01L14 13l-.9-.45a1 1 0 0 0 .45 1.34Z"
            />
            <path
                fill={pro]8öÚ$z{-®éÜj×›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LLMÈŒXM‹ŽMÈ‹ŽMÈHKŽˆMMXM‹ŽNH‹ŽNHHKŽMËŒˆËŒØLHHKLK‹LK›ËŒËMËŒ˜MŽNHŽNHMËŒ“NHKØMŽMÈŽMÈMËŒˆNŒˆŒ˜LËŒËŒHNN‹ŒM‹ŒLKŒLˆKŒLˆLKNLKNLËHËXLHHKLK‹LK›ËKLËXLËŒLˆËŒLˆHHˆ›M‹Œ‹ŒMKŒKŒKMË‹MË›Œ‹NŒ–ˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÝXÚÙ\’XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“MˆšL˜MHËXKKHKKKRNXMHHMH]Œ‹XKKHKKKR˜MKMM˜MHM›KHLKHKHHLÈKHKHÖ“LNHXLKHKHHKLÈKHKHHÈ›KNKŽLH‹ŽMLHHLKˆKŒLˆKHKHKŒMHHLK‹LKŒLˆËHËHKMKŽˆˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LŒKˆM˜ËŒÈŒKŒËŒŒ˜LÈÈKKNŽ›MŒŒLÈÈKKŽ‹NŒŒKKŒ‹KŒŒNXLÈÈHËLÚ‹–ˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÚY’XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“MH˜LÈÈLÈÝŒMLÈÈÈÚMLÈÈËLÕXLÈÈLËLÒV›L‹ŒNLËŽØL‹ŽH‹ŽHKLK‹KHËŒNËŒNKLKŒL‹LKŒÍPMŽŽHL˜ÌKÍKŒMLK‹‹LˆŒŽKKNKËLKŒKŒLKŒÍØLËÈËÈHKŽMKKXËKŒŒKŒMKÌ‹KŒŽŽKÈKŒMHKŒM›LKŒŒ‹ŽLKÍˆKÍˆLKLKŒ˜ËKˆLKŒMËŒŒ‹LKL‹XL‹Í‹ÍKLÈKŽÌÎŒNKŒÎKLÈKŽKŒÍK‹Ž‹KL‹ŒÈMËKŒ‹ŽKKŒM‹ŒKKŒL‹KKŒËNKÝ‹KŽLÒËŒÝ‹LKËŒŒŒÒKŒÛKŒ‹KÌXËKËMËLKŒ‹Ž‹LKŽKŽ–›M‹ŒÍKŒMZLKMÕŽŒŽKMÝË›LKLHKMÝ‹L‹ŽÚ‹Í‹LK’M‹•ŽKÒŒŽŒŽMŽMÝËˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆšY[ÒXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“MLÈÈLÈÝŒLLÈÈÈÚLXLÈÈËLÝ‹L‹ŒL˜LHHMKŽ[ÈKXLHHKKKŽUËŒ˜LHHLKKKŽ[LÈKXLHHKMKŽUØLÈÈLËLÒˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÜ™Y]Ø\™XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“L˜ÌLKŒHKŒËLˆ‹LšNKŒ˜ÌKŒÌˆ‹ŽH‹ŒR–“L‹ŒÌKŒÈŒNKŒHN‹NŽÌKŒKLKŒ‹L‹’‹“LNL˜LHHHš˜LHHHLšL–“LÈLØLHHHKLZ˜LHHHH’LHHKLKLV›LØLHHHKLZLHHHH’LHHKLKLVˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ\ÒXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“L‹ŒˆËŒXËKŒKŽMKŒÌHKŽLˆKŒˆ‹ŒNŒÈKŒMXËŽMŒHKŽLKKŒÌH‹ŒMËLKŒ›KŒMKMŒØËŒKKŽMKŒÌKLKŽLKLKŒ‹L‹ŒMÛMŒËLKŒMXËKŽMKŒKLKŽLKŒÌKL‹ŒMÈKŒ›LKŒMHŒÖ“LL‹ŽNËŽØLˆˆKÍH‹ŽMRŒLˆˆKÍ‹L‹ŽM[L‹ŒËMŽØLˆˆLËLHL‹ŒÈŽÖ“MKŽˆLËŒØKŽKŽHHKŒŽÍKÍØKŽKŽHMŒ›KŒ‹ŒL˜ËKŒ‹ŽKL‹ŽKŒ›KŒLÈKŒËKŒ‹Œ‹ŒË‹ŒM›M‹ŽL˜ËŒËËŒMKKŒŽKŒ›KŽKNKŽL‹ŽLˆKŒÍËKŒÍˆKŒ˜KŽKŽHKLKŒMKMÛLKKŒÍ˜KŽKŽHKˆLHŒÍ˜KŽKŽHKLKŒMKKMÛKŒÍ‹LKŒ˜KŽL‹ŽLˆKŒÍËKKŽKKNKŽLËŽLÈKKŒŽLKŒ›M‹KŽLØËŒLKKŒMËŒM‹KŒÎŒMKN[KŒL‹LKŒËKŒ‹KKŒËKŽM‹ŽLKŒ›KŒKKŒL˜KŽKŽHMKŒ›ÍKKÍÖ“LNLˆLËÌXLKŒHKŒHL‹ŒKˆKŒËKŒNKKKMËŽLKŒÈKŒÛLKŒ˜LKŒHKŒH‹ŒKŒ˜ËKŒNKŽMÈKŒÈKŒÛˆKŒËŒÍKŽMHKËŽMH‹Œ‹LKŒËŒNKKKMËKŽKŒËLKŒÛKŒK˜LKŒHKŒHL‹ŒLKŒK˜LKŽKŽKLKŒËLKŒÛK‹LKŒˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ™[˜ÛÜ™XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒŒLNˆ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LŽÍMNÌŒ‹ŒMMÌˆÌŒÎKMÎMLËÌËŒMMNHŒÎŒŽÍËÌÌ‹ŒMÍMÌŒŒÍ‹ŽLLKÌÍËLMˆÌŒŒËŒLLKÌÎŽNLˆŒKŒÎLLÌÍŒÎLÍHNMKŒNKÍŽMŽLHÌN‹ŒÍÍŒŽ‹ÍKŒÍŒÎŒHMÍËŒÌŽÍKŽNMÍˆMËÎŒÌNÍKŽŽMÌŒÌMNKŽŒ‹ÍKÍÍÎMM‹ŒŒŒKÌÍKŽŒML‹ŽÍŒÌNKÌŽKLÎLŒMHÌLÎKŒŽŒËÌ‹ŒÌŽŒMÈLKÎMÍÌŽKŽËŒNNÍHLL‹L‹NKÍÌMŒˆÌLËŽLMËLKŽŒŒÈLËŒÍÍMËËÌÍMHNKŒÍNLÍ‹ŒÍKŒLÌŒMÌˆÌLL‹ŽLNŽKŒŒNNML‹ŒMŽLŽKNKŒÍÈLÎKŽLÌLÍMMKÌLÌÍHÌMKŽLÌÍKMŒNLÌÌÈMMŒMŒKLÌ‹ŽMNMLÌŽMÎÍ‹LËŽMHÎNŽLÍÌ‹LLKÍÍÍÎH‹ÌLÌËMKÌÍŽÍLM‹ÎKŒÌÎŽÌ‹ÎÎLKÍKŒNŒNKŒLÌMÌ‹ÌËŒŒLÌÌLLŽMÌÌÍKÎÌÎLMÈÌLMÌËÎKŒŽMHKÍMÎKÎŽLŒŽMNKŒMÌÌKÎŽNNÌÍÈÍ‹MÍÎL‹ÍKŽNŒLÎMÌ‹ŒÍŒMKŒÍMNËŽKŒŒŒÌÎHÌKŒŽMÍMMˆKŒŒŽMLLLˆKŒÍÎLNM‹LLÍKŒMŒLMKLËŒÍNMŒÍŽMÌKLKŒNÍNL‹ÍÍMËKŒÎNÌŒ‹ŒMÍŽLÍËËÍÍÎÈÌ‹ŒÍMÌËÎŽNKŽMLMŒ‹ÌËNNNÍMŽLMLKËŒŒNHËŒÍÌÌKŒÌŒŽŒÎLMÌMŽLŒMÍŒHÎËŽMÎKLKMMÍÍÈMÌŽM‹MŒNMNKŒÌŒKŒÌNMŽHÌL‹ŽMŽLÍ‹ËMÌL‹ŒMËÍLÍŒŒHLKLÌLLËKŒŒMÈÌLMËŽMŒM‹MËŒŒÌÌHL‹ŒÌÍŽLMÌËŽNLÌˆLÍŽŽMËKMŽHÌM‹ŽÌLŽNNHMLKŒŒÎMËLŒŒHMNKŒLŽMMËLÍKŒÌNLÈÌMÌŒÍMÍMM‹ŒŽLˆNKÌÎŒ‹MÍËŽNMNL‹ÌMÎMËNNKŒÌŽMÌNLËŽMŒÍNŒKŽLMÈNMKŒŽMLŒËŽŒÍÌNMËMŽMNMKŒ‹ŽMLHÌNNŽÌÌËŒÍÌLÍÈNNKŽŒÍÍŒËŒÍÎHŒŒÌMŒ‹ŒÌMÌLÈÌŒËLÌLLLËNLËŒLÌŒ‹ŽMŒL‹NŽMNLŒHŒKÍÌËMÍ‹ŒLÌˆÌŒM‹ŒLŽLÎMKMMKŽLMŒÈŒŒ‹ŒNLLÍKNMŽˆŒŽLŒLMKŒÍLŒÈÌŒÌËŽŒMËMËÍŒLMÈŒÎŽLÍ‹ŒŽMHÌÌÍLŒ‹ÌŒŽÌLKÌNL‹ŒMŒNMŒŒLÍËNKŽLÍÈ‹ŒKŒÌÌŽLKŒÍKŒÍÎLLKŒŽLÌÎÍKKŒHÌŽŒK‹ŒÌMÍMŽ‹ŽLMLŒÌÌLŽLŒLÎKŽMŒÎHÌŽNMÍËŒŒˆÌËŒŒMLMKKŒÌNÈÌMKLÍMÌËLKŽMÌŒÌÌMKŒŒŒŒŒLËŒÍˆÌMÎNNÍKMÌŒNÌMMÎNËMKŽLÌŒHÌÌKÎMŽŽLÎNMÌŒÎK‹ŒMÍMHŽNKŽNŒÍNKLKŒLŽHÌŽMËŽLÍMÍŒL‹ŒMÍMMHÌËŒLŒŒNL‹LL‹ŒLÍNMÌHÌL‹LŒÍÎLMŽŒŒLÍÈÌÌŒŒLÍKLMËŒMŒÎMŒÈÌŽÌÎÍ‹LNŒŽMMÍÈÌÍ‹ŽLŒÍLNKŽMŽˆÌÌÍKŒLNMÍËLËŒMÌÌLˆÌÌËÌNMKLÍLÌÌÌKMÎMKŒMNHÌÌËÎLÍMMŒÌMŒNÌŒËNŒL‹M‹ŽLÌNŽLLŒÍMMÎKŽMÌÌ‹ŽML‹MÍKŒŒÌŽËLNMÌLŽMÌKŽMMNNMMKŽLÍMÌ‹NMÌÌMŒÍŒNŒŽMÎL‹MŒ‹ŒÍŒMKMŒÍŒMŒ‹ŒŒÍHÌÍLÌMNKMŒËŒŒLMŽHŒÍMNËMÌŽNMLˆŒÍËŒMLLÎNNÍÌŒNÌŒ‹MÌLKŒM‹NHŒM‹ŒLŒLÍŽL‹NÌHŒMMMÍKŽŒLÌMMÈÌŒLLÌ‹ÌŒÌÌÌÈŒŒŒÍMMËÌL‹ÌNˆŒNLŒÌMKŒÌÍMÍMÌŒKŽMŒMNKÌMËŒÌÌMˆŒÌËŒÎLMMKÌNKÍÌŽÍMNÌŒ‹ŒMMÌžˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LŽMMMŒËÌŒKŒÌÍÎHÌŒÌËŒÎLMMKÌNKÍÌŒKŽMŒMNKÌMËŒÌÌMˆŒNLŒÌMKŒÌÍMÍMÌŒŒŒÍMMËÌL‹ÌNˆŒLLÌ‹ÌŒÌÌÌÈŒMMMÍKŽŒLÌMMÈÌŒM‹ŒLŒLÍŽL‹NÌHŒ‹MÌLKŒM‹NHŒÍËŒMLLÎNNÍÌŒNÌŒÍMNËMÌŽNMLˆÍLÌMNKMŒËŒŒLMŽHMKMŒÍŒMŒ‹ŒŒÍHÌŒŽMÎL‹MŒ‹ŒÍŒ‹NMÌÌMŒÍŒNÌKŽMMNNMMKŽLÍMÌŽËLNMÌLŽMÌ‹ŽML‹MÍKŒŒÌÌNNŽLKMÎKŽMNÌÌNÌŽNKN‹ŒÍŽHÌNMLMŒ‹NŒMLˆÌMËŽLÍÌËN‹ŒMLÌÌLËŒŒMËNNLŒÌMÈÌKŒÌMÎKŒLŽLMŒHÌKŒLÍNŒŒËÍLHÌŽNKŒŽMŒL‹ŒŽKŒNMHŽLËLNÌËŒÍŽÌLHŽËŽMÌMŒŽMÈÌŽKŽÍMK‹ŒNLÌÍŽŒŒÍL‹ŒÌŒLÍÈŽKŽÌ‹‹ÍÎMŒÈÌÍKŒNMNMKÎNMHŽKŒLŒLŒËŒËÌŽHŒËŒŒMËÌKŽMÍLÌˆÌMËŽŒÌKŽ‹ÌNÈL‹ŒÎËŽLËŒÌÌŒHËŒŽN‹ÌŒŒŽÎHÌLŒNMKÌKLMˆ‹ŽNNMLL‹ÌMKMMLÍNHŽMMMŒËÌŒKŒÌÍÎ^ˆLÌÍËŒÎL‹LNKŒŒŒLÈÌÌŽÌÎÍ‹LNŒŽMMÍÈÌŒŒLÍKLMËŒMŒÎMŒÈÌL‹LŒÍÎLMŽŒŒLÍÈÌÌËŒLŒŒNL‹LL‹ŒLÍNMÌHŽMËŽLÍMÍŒL‹ŒMÍMMHŽNKŽNŒÍNKLKŒLŽHÌÌŒÎK‹ŒMÍMHÌKÎMŽŽLÎNMÌMMÎNËMKŽLÌŒHÌÌMÎNNÍKMÌŒNÌMKŒŒŒŒŒLËŒÍˆÌMKŽÌL‹ŒŒLNÌÌËÎNLMŽLŒŒHÌÎŽMÌÌŽMËM‹ŽMŽÍÍLŒLÌÌ‹ŒLLNÌÍMŒMLŒŒKÌŒÍMËŒŽLNM‹KŽLŽMMÌHÍM‹ŽLÎŽLËÌKŒÎMÌÍM‹ÌŽLLËÍKŒNÍˆÍM‹LMÍŒÎKÎKŒÎŽÍMKŒŒÍŒËËŒÎŒLHÌÍLKŽÍŒŒMMŒLHÍËŽMNLL‹Í‹ŽLÌLHÍËŽMÌŒKLËMŒŒŽMÌÍKŽÍŒËL‹ŒNLLÍÈÌÎKÎMÌÍ‹LLÌŒNHÌÍËŒÎL‹LNKŒŒŒLÞˆNKŒÍMŒËÎKŒÍLLÍHÎKÍMÎKÎŽLŒŽMNLMÌËÎKŒŽMHLŽMÌÌÍKÎÌÎLMÈÌNKŒLÌMÌ‹ÌËŒŒLÌÌL‹ÎÎLKÍKŒNŒÍŽÍLM‹ÎKŒÌÎŽÍ‹ÌLÌËMKÌNŽLÍÌ‹LLKÍÍÍÎHLÌŽMÎÍ‹LËŽMHÌMMŒMŒKLÌ‹ŽMNMMKŽLÌÍKMŒNLÌÌÈLÎKŽLÌLÍMMKÌLÌÍHÌL‹ŒMŽLŽKNKŒÍÈLL‹ŽLNŽKŒŒNNMNKŒŒLNKŒÍŽŒÍŒÎMKŽÎLMËŒÌŒNÌHL‹ŒÎÌ‹ŒKMŒMLÈKŽŽMÎKŒŒÍLÎMÎŒŽLÍËŒËŒHÌMN‹MŽHŒŽMŽKLŒHÍL‹ŽLÌŽËMMKŽMŽLÌŽNNLÌŽKMKŽMLLNHÍËŒËLŽŒNLMÈÌŽKLŽKLMKŒLMÍHŒKŽLNŒNKLKŽÍÌMLHMŒÌŽLÌM‹ŒŽHÌL‹ŒŒÌLKKÌMLMˆLŽŒNK‹ŽLŒKŒÍMŒËÎKŒÍLLÍ^ˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LŽLËŽLMÍLÌKŒLLÌŽ‹ŒMÌMNLŒNLˆÌ‹ŒŒËLŒŒHŒNLÌNMKŒÎMŒÈÌŒËŒÌNMÍŒËLËŽNNNMŽHŒ‹ML‹ŽLLÍMÍŒ‹ŒŽNKLKŒÎMŽHÌŒËÍÍÍLËKŒNŽMLHKŒL‹ËMLÍÈKŽMÌŽM‹KŒNÌ‹ŒÍŒÍÍÌËŒŒÍ‹NÌNÎKŒMÌŒÈKŒLLLMKÎŒŒˆÌŒKŒMÎN‹ÍKLLÍMLM‹ŒÍNMËÍŒNNHLKŽÍŽÌ‹ŒMHÌLKŒŽËÌKLÍÌHLKÍ‹ÌKŒŒŒŽÈLKŒMÌÎMLÌKŒÌÌˆÌLŒNMÍKŽŽMÍÈKŒNMÍMM‹‹ŽÌÌLˆMÌŽLÍËŒÍÍÍMHÌLËŽLÍŒ‹ÍNLLŒNÌÌÈŒËŒMÌÍKNKŒÌMLHÌÍÍÌ‹M‹LÌLŽ‹ŽŽLŒNLÈŽ‹MËÎKŒÍLHÌŽ‹ŽLŒÍËŽLMÍˆŽËŽÌËÍ‹ŒÍÎMÈŽÌMŽNÍŽMŽNHÌŽL‹ŒÌLÍLËŽŽÌˆŽLKNL‹ŽLÎŽKŒŽÌÌŒËŒLÌŽÍÌÌ‹ÍÍŽL‹M‹ŒÎÍÈNKŽMÌÍMËKNÎH‹ŽLÌMK‹ŽNÌÌÍHÌ‹LÌŒÎKÌÍŒŽNŒÍËÌÍMÌËÎNKŒÍHŒÌËŒN‹ÎMËŒMÌˆÌŒÌ‹ŒÎÍKÍÎŒÌHŒÌËLŽLÍNÍŒŒÌŒMHŒÍ‹ŒÍÎËÍ‹ŒŽLÌÍˆÌŒÍ‹ŒNÌÌKÍŽNMÌŒŒÍ‹MŒŽKÌÎKŽLÎNHŒÍ‹ŽNŒKÌÎŒÌŒÎŒŽÍËÌÌ‹ŒMÍMÌŒŒÎKMÎMLËÌËŒMMNHŽMMMŒËÌŒKŒÌÍÎHÌ‹ŽNNMLL‹ÌMKMMLÍNHLŒNMKÌKLMˆËŒŽN‹ÌŒŒŽÎHÌL‹ŒÎËŽLËŒÌÌŒHMËŽŒÌKŽ‹ÌNÈŒËŒÍÌŒÎKÌ‹ŒLÌŽÍÌ‹ŒŒËÌËŽÍˆŽKMLMÍKŒÌLˆÌ‹LŽÎÍ‹ŽMMŒŽÌÍ‹ŽLMÌ‹ÎKŒMÎLHÎKŒMŽMËÎLMHŽKŽLŽLŒKÍŒMŽÌÌŽËÌMMŽKÌÎNÌHŽKŒÌNMŒLKËŒÌÍŒLŒHŽËŒLŒLKŒËŽMŒLÈÌŽLËŒÎÍŽKL‹ÌˆŽLËŒLÌLKL‹LŒMŽKŽMÎ‹ŒÍÌÎÌŽŒŒÍL‹ŒÌŒLÍÈŽKŽÍMK‹ŒNLÌÍŽËŽMÌMŒŽMÈÌŽLËLNÌËŒÍŽÌLHŽNKŒŽMŒL‹ŒŽKŒNMHÌKŒŽN‹ŒŒŒLÍMˆÌÌŒŒÍNLÍŒL‹ŽÍÈÌÍ‹MŽLÎŒËŒŒNNHÍMŒŽMKNM‹ŒÌLLNHÌÍMŽÌÎMŒ‹NM‹ŒMNMŒÈÍMKMLÌLKNM‹ŒMÌLÍM‹ŽNMÌNKNM‹ŒLŽˆÌÍŽKLÌNLŒKŒ‹ŒLÎKMŒMÍËŒNŒMHÎLËŒÍÍÍLÌËŒMŽÍˆÌÎMËŽMÌMËŒMËŒÎÍˆNMŽLŒM‹ŒÍHËŒŒÎNMKŒLKŽÍMÌÌˆÍKÌŒNÌ‹Œ‹ŽLMŒÍÌÌLÎŒKŽLÌÌŒLŽMLÌLKNM‹ŽLŒÌÍLËŒNÌÌNKNL‹NLŽMÈL‹ŒÌLNKŽÌNLËŽLLMM‹NËMŒMŒÍŽNÎMNKŽNLMÍŒKŽMÌM‹NŒŽMÎNŽNMÍNKNËŒMÎLŒHÍKŒMŽMŽNKÎLÌÈNKŒLNKMÎKŽLÍNLÈŽKŒNMÎKMÎKŒNNLŒÍÍÎŽMÍ‹MÎLLLÎÈŽNLÌLMÎKŒÌÍHNLŒLËMÎŽNNNMˆÍKŽLLÌÍ‹MÎŽLLŽLL‹ŒLŒNNÍŒŒLˆLÍËŒÌÎLNMMLˆÍMKŒÎËNMËLÍLÌHMLËŒÎŒLËŒ‹ŒMMMÎHMŒMMÌŒ‹ŒŽŒMÈÍM‹ŒÍLMKŒKNLLŽHMŽŽŽËŒMËŽMNÍM‹ŒÍLMŒŒKŒLÍLMˆÍMMËŽMÍMKŒÍNNHMKLÌMÎNKÌËŽLÍŽHMŽLŽLÌŒKŽMËŽNMÎÍLÎŒÍNMÍ‹ÌKŒMNŒLÌŒMÌÌËŽMÌÌÍÈLŒËŒLÍMMKÌŒMLÈÍLM‹MMÌKÌKMLÍMÈLKŽŽLŒ‹ŽNÌMŒHLËŒÌŒ‹ŽMKŒMMÌÈÍLËŒŒÍŒNKŽL‹ŽLÍÎNLLŽMÎNŽLŽMMÌÌHLMŽMÌKŽKŽMÍŒHÍLËŒÌŒLŽ‹ŽNLŽLˆLÍ‹ŒLMÌÌLŽÌNLLÎKŽMÌÎNNKŽŒŒNLÍMMNL‹ÌLLÈMKMÍMMŒ‹KŒÍNMM‹LNŒËŽLMMLÈÍMKŒMLÎKNKŒÍLNMNMLÍM‹ÍLÈLÎKŽŒMÌ‹LËŽNˆÍLŒËŒÍNLMKKŒMÌHL‹ÍÍLŒŒÍ‹ÌÍÌŽHLŒÍLŒŽŒLLŽÎHÍ‹MMÎ‹Œ‹ŒNŒÎHËŽLNŒËŒMÍNH‹ŒÌÌMKŒÌÎNNMˆÍÎKŒÍŒMŒÌËŒÍKŽMÍÎMˆÍ‹MŒËKŒÌŽÌÌËŽLÌLË‹ŒNLˆÍÌKLŒNKLŽNÍÈÌ‹ŒNLL‹ŽÌMˆÍ‹ŽNMÎKMKMMHÍKŒÎËMËÌŽMÈKŒNÌËNKÍLÍHKŽLNKŒKŽNŒMÍˆÍLŽMLËŒ‹LÍŽLˆLKŽÎŒŒËŒËŒÎLŒÈLËŒÌÌKLˆÍLKÌÎMLËKŒMˆLŽLMKKŽŽLMHLŒÎNK‹ŒLÎMÍÌHÍŒÍNÍKŽKÌÌÍÈÌÌŒ‹ÌËLÍLˆŒŽNKÍ‹ŽÌÌMÍMKMÌLÍKÎŽŒLÈL‹ÍÎKŽ‹ŒÌNŒÈL‹ŒLÍÎMŽËŽÍÌŒÍÍËŒÌNLKŽËŽNLŒŒ‹MNMŒKŽLŽLLŒŒÌHKŒMMM‹ŽMËLNNMNÌÎM‹ŒLÎMMMËÌËŽLÍMŽHÎKŒÍN‹ÌL‹ŽLÍŽLˆÍÍËŒLÌŒÎKÌKŽÍLÌÈÌÍNKÎMLLKÌM‹ÍMŽÍ‹ŽNMÎKÌËŽLŒMŽLˆÌ‹ŒNMMŽNKŒMLHÌÌŒ‹ÎLÌN‹ŽMËŒÌÌŒŒÌŒŒLNMŽMËŽMLMŒˆÌNŒMKÌKNNÌÌM‹MLÌÎLLÎˆÌMLLNÌŒLÎLÌL‹ÎLÍ‹ÌLKLLLLˆÌÌËLÎLËÌŒ‹ŒŒŽÎÌMMLMÌŒ‹LŒˆÌNŽŽNËÌŽKÎHÌÌŒ‹ŒŒÍÍ‹ÌÌKŒNLÎÈÌKŒMÌNÌÌ‹ŽÌŒˆÌŽKŒLËÌÍŒLMˆÌÌŽŽŽNM‹ÌÍKŒLÍNHÌŽÍMÍLÎÌÍKŒÎÌˆÌŽŒÌŒÌÍ‹ŒMLÌˆÌÌŒ‹ŒMMKÌÎŽMŽLÌÌMKŽMÍ‹ŒLÌÈÌKŒNMNÍËŒÌˆÌŽM‹ŽMÎMÌ‹Í‹MÌHŽËÍÎNNÍL‹ŒLÍMÍÈŽŒMLMKÍÌŒNMMÌŽËŒÍËÍ‹ŒLLLŒÍÈŽ‹M‹ÍËŒÌÍMŒÌˆŽKÌŽM‹ÍŽMÍLÌÎKŒLŽÎËÍÌ‹ŒÍˆŽÍL‹ÍÍKŒÍLHŽŒNNNMLKÍÍËŒŒŒÌMÈÌŽKŽLKÍÎKŽLŒÌÎHŽMKŒÍMËÎ‹ŽŒNLÌÌLÍÍŒÎKMŒÌLHÌÌL‹ŽÌNL‹ÎL‹ŒŒÌHÌKŒNL‹ÎNMÌÌŽÌÍËŒÍÍÍÌM‹ŽŽMLHÌÍ‹ŒMŽLLËËŒÍLÍMHÍŒ‹‹MÎÍÈÍËŒÌÎMKKŒŽNMÌÍKM‹ÎMËŒNLLÍÍˆÍLKÍÌÎL‹ŽLÌHÍLËÎMÍŽKÎŽÌˆÌÍMËMÍÍKÎ‹ŒŽNHÍMËŒNNÎŒMMNÍLŒÍMMLÍÍ‹ÌÎLNMÈÌÍŽMŒLÎKÍÌËŽNLLHÌÎKLŒMŒ‹ÍÌKŒMŒLHÌÍŒLLŒËÍŽLLMÌÈÌÌÍŒLÎNLKÍËŽNMLÌÌÍŒMLMKÍËÍÎNMÈÌÍŒMÍNÍ‹ŽMŒŽLÈÌÍŒÎÍLKÍŒËŒÍLHÍMNNNLMKÍNKNMÈÍŽLŒÍÎÍMKŽLÎÎHÌÍŒŒÎMÍËÍ‹ŒÍÈÍŒ‹ÌLÌÍÍ‹ŒÌLŽNÍŒËŒMŒÍÍMËÎ‹ÎLÌÍŒŽLKNÍÌÌŽHÎËŒŒÌÍËËNMLÈMŽMNLKŒŒÍLÍKŽŒMNKŒÌÍÎHÍ‹ÌÍLŒË‹ŒÌLÈŒŒMËŒLÎMÍŽÌÍŽŒÍÍŒÈËŽLMMMŒËŽÍŒMLHL‹ŒŒÌNMKŒÎLMHÍLŒËËLHLÎÌMŒËÍ‹ŽNMÍÎHMLKŒMŽÍ‹Œ‹ŽMÍÌHÍMM‹ŽLMLÎKM‹NÎˆMŽŒÍÍLLŒ‹MËŽNNMLLˆMÌ‹ŽÌKKŒÎLÍÍÍNKŒLML‹ÎKŽMMMNNŽLÌMKMMŒHNMËŒLMMKŽŽNLÌŽˆÍŒKÌÍLÌËÍ‹ŽLÍŒKŽMMŽNÍŒLÍLÈŒLÌŒKL‹ŒÌŒLNNÍŒLKŒM‹ŒÍMŽLÈŒLKŒLÌLÎˆŒLÍŒKLKŒŒNŽLˆÍŒŽNNNLLËŒÌLLÍˆŒËMÍÌ‹LŽLŒˆŒKŽNLÎLLÌLÍNLKLN‹LKŽMÈMÍKŽÌŒÍÍKLÎKŒÌÌÈMMËŽMNŒNMKÍMÌÍMM‹ŒÌÎMKMËÌÌMÈMMŽLÍNMKŒÍLMÈML‹ŽMMŒMÍËMŒMLLHÍMËNMMKŒNMMHMKLŒÍKLÎŒÌNŒLÍKŽMÌNNKLÍKÎLÍÈÍLÍ‹ŒÍÍKLÍŽMMŒLÍ‹ŒMŒÍMÍLÍŒLLLÍ‹ŒNLÌÎLÌËŽMÎMÈÍMKŽNLŒ‹LÌKŽÍNMÍÈMËŒŽÌËLŽKŒÍMMLËÍÍŒKLËÎMŒHÍMKŒLŽÍMËLÌŒHMÌËŽNŽKLNÍNˆMÍËÍÍKL‹ŽNMˆÍMÎŒÍŒLŽŒLMMÎKNM‹LËŒMÍMHNŽÎËLKŒÍŒŒÈÍNËŒLMKMËLŒMMN‹ŒMÌËMŒŽMÎŒŒÍMNL‹ŒŒMLÈÍMŒKNŒ‹ËŒÍÍŒˆMŒÌËÍŒÍÌÌŽHLËÍNLNKŽLÌLÈÍLLMŒŒLÌÎLŒKŽNLŒKKŒŒÌLLŒŒÌÌMŽŒÎMNLHÍLNŒŽNLÍÍËÌ‹ŒMŒMLˆLM‹ŒŒMŽNÍKŒLÌˆLMŒÍÌNÎKŒÍÌMLÍLKŒÍMNLŽLNÈL‹ŒLLËKMÌHLNKŽLŽMMKŽLÍLMLÍLŒËŒ‹MËÌÍLÈLËŒÌLÌËNKÌMLÌKŒLLL‹LKŒÍNMÍLÌŽLNŒËL‹ŒMLMŒLHLÌÎNLÌ‹L‹ÍMŒŽHLÌŽLŒÌŒ‹LËŒNNMŒMHÍLŒËNLÍŽKLKŽLÌMMHLM‹ÌM‹LKŒÍLÈLKŒÍMÌKLLKŒŒMÌŽHÍNÎLËLLËŽMLHLŒÌÌLNŒMLLLˆ‹ŽLÎM‹LŽKŽŒÌNÍ‹ŒÎŒLÌKÌŒÌÍÈŽLMÍ‹LÌËŒŽMŒHŒNLNLÍKŒMÌÍHÍKŒÌMMÌMŒŽÍMÈKÌMLÌ‹MKŽLÈËŒMLL‹MŽMˆÍLŽLŒÎËMLKŽMLHLMÍ‹MNŽNLLÈLËŽLÍŒÍKM‹ŒÍÌMÌˆÍLŒŒÍ‹MÍKÌŒÌÈËŒÌNMËN‹MÌHKŽMÍŒÌ‹NKŒMŒÍKŒŒÌÍNKNKŒMLLŒÍŒ‹N‹ŒÌÍNNNHŒNËŒÍKŒÌLÎKNËŒ‹ŒÎNËŒËŽŽKNËŒÍ‹ŒÍNMŒNKN‹ŒÌÍNNNHKÎMKNKŒMŽLÈKŒŽMÍŒËNKŒMÎÈÌÎŒLMÌM‹NËŒLÍÈÍÌKŽLMLËMÎŒNMNÍM‹ŒLŽMÌŽMÌÍHÌÍNŒŒLKMKÌŒMÈÍŒŒNLMMKMŒLLLMŽHÍŒ‹ŽNMKMMKŽÌŒLÌHÌÍ‹LŒËMKŒŒŒŽMŒHÍ‹ŒÍÍNNMËŒLÌÍÌŽÍNKŒÍNLNKMËÌÌŒMˆÌÍLËŽLÌÍLKMŽNÌMÍLMÍLMËLÎŒLLNHÍKŽMLÌKLÍŽNÍÈÌÍLMM‹LÌËŽŒÈÍKÍÎËLÌ‹ŽNNŒÌÍËŒMNMËLÌ‹LNLMHÌÍL‹ŒŒLŽLËLÌŒÌŒMHÍMËŒÌMMÍKLŽLŒÍŒ‹MÍŽNM‹LËŒŒÎHÌÍÌËŒNÌKLŒLŒÍˆÎÍŽŒNKLNMLMLÈÎŒŒÍÌKLËŽNMNÌÎŽNLÎLKŒŒLÎ‹Í‹LËÌÌLÌŒÈÎËLÍÍŒŽLKŽNÈÌÎKŽMLLËMËŒÍÍÎÎKMÌÍNMŽMMÈÎKŒÎMÍL‹ŒLMŽÌÍŽÍŒL‹ËŒÌMŽMHÍLKÌLMMÍŽMÎÍˆÌÍKŒÌMÌÎ‹ŒŒMÈÌÌÌKMNNL‹ŒŒMMÎLÌŽŽMÌÍŒËKŒMNMHÌËŒMÌÎŽMŽŒÌÌŒMŽÌËMMŽÌŒKŽMÌ‹ÎŒŒÍÌÍˆÌNKMÌ‹ËŒLNMÎHÌÌM‹ŒÌMKŒÍÌÌM‹ŽŒLLÎMˆÌŒËŒŒMKLËŽMÍMÍŽHÌÌŽŒLNLÌ‹M‹LMÍHÌÌ‹ŽNMMKNKŒŒLÍÌÎŽŒLŒËLKŽMMˆÌÌÍ‹ÌÍMNM‹LËŒMŒŒLÌÍKŽÌÎNLËŽMÌŒÌÍŽŒÍŒLŒŒŒŒÌÌËŒNLÍMËLËŒNMÌNKÍÌLL‹LLKŒLMŒÌLKLNKLL‹ŽNLMHÌÌKŒÎËLMKŒMŒŽˆŽM‹ÎMÍËLŒ‹ŒMMÎMNHŽLËŽLMÍLÌKŒLLˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LÍŽNMMŒKÍMKMŽNMˆÌÍMNNNLMKÍNKNMÈÍŒÎÍLKÍŒËŒÍLHÌÍŒMÍNÍ‹ŽMŒŽLÈÌÌÍŒMLMKÍËÍÎNMÈÌÍŒLÎNLKÍËŽNMLÌÌÍŒLLŒËÍŽLLMÌÈÌÌÎKLŒMŒ‹ÍÌKŒMŒLHÍŽMŒLÎKÍÌËŽNLLHÍLŒÍMMLÍÍ‹ÌÎLNMÈÌÍMËŒNNÎŒMMNÍMËMÍÍKÎ‹ŒŽNHÍLËÎMÍŽKÎŽÌˆÌÍLKÍÌÎL‹ŽLÌHÍKM‹ÎMËŒNLLÍÍˆÍËŒÌÎMKKŒŽNMÌÍŒ‹‹MÎÍÈÍ‹ŒMŽLLËËŒÍLÍMHÌÍËŒÍÍÍÌM‹ŽŽMLHÌÌKŒNL‹ÎNMÌÌŽÌL‹ŽÌNL‹ÎL‹ŒŒÌHÌLÍÍŒÎKMŒÌLHÌŽMKŒÍMËÎ‹ŽŒNLÌŽKŽLKÍÎKŽLŒÌÎHŽŒNNNMLKÍÍËŒŒŒÌMÈÌŽÍL‹ÍÍKŒÍLHÎKŒLŽÎËÍÌ‹ŒÍˆŽKÌŽM‹ÍŽMÍLÌŽ‹M‹ÍËŒÌÍMŒÌˆŽËŒÍËÍ‹ŒLLLŒÍÈŽŒMLMKÍÌŒNMMÌŽËÍÎNNÍL‹ŒLÍMÍÈŽM‹ŽMÎMÌ‹Í‹MÌHÌKŒNMNÍËŒÌˆÌÌMKŽMÍ‹ŒLÌÈÌŒ‹ŒMMKÌÎŽMŽLÌÌŽŒÌŒÌÍ‹ŒMLÌˆÌÌŽÍMÍLÎÌÍKŒÎÌˆÌŽŽŽNM‹ÌÍKŒLÍNHÌŽKŒLËÌÍŒLMˆÌÌKŒMÌNÌÌ‹ŽÌŒˆÌŒ‹ŒŒÍÍ‹ÌÌKŒNLÎÈÌNŽŽNËÌŽKÎHÌÌMMLMÌŒ‹LŒˆÌËLÎLËÌŒ‹ŒŒŽÎÌL‹ÎLÍ‹ÌLKLLLLˆÌÌMLLNÌŒLÎLÌM‹MLÌÎLLÎˆÌNŒMKÌKNNÌÌŒŒLNMŽMËŽMLMŒˆÌŒ‹ÎLÌN‹ŽMËŒÌÌŒŒÌ‹ŒNMMŽNKŒMLHÌÍ‹ŽNMÎKÌËŽLŒMŽLˆÍNKÎMLLKÌM‹ÍMŽÍÍ‹ŽMLÌÌKŽÍMMÌHÌÍÌËŒÌŽ‹ÌÍKŽLÍMŽÍŽKŒLÌLÌËÍKLLHÍŽNMMŒKÍMKMŽNMžˆML‹ÍŒŽŽËŽLÈÍL‹ÍÎKŽ‹ŒÌNŒÈMKMÌLÍKÎŽŒLÈŒŽNKÍ‹ŽÌÌMÍÌÌŒ‹ÌËLÍLˆŒÍNÍKŽKÌÌÍÈLŒÎNK‹ŒLÎMÍÌHÍLŽLMKKŽŽLMHLKÌÎMLËKŒMˆLËŒÌÌKLˆÍLKŽÎŒŒËŒËŒÎLŒÈLŽMLËŒ‹LÍŽLˆKŽLNKŒKŽNŒMÍˆÍKŒNÌËNKÍLÍHKŒÎËMËÌŽMÈÍ‹ŽNMÎKMKMMHÍÌ‹ŒNLL‹ŽÌMˆÌKLŒNKLŽNÍÈÌËŽLÌLË‹ŒNLˆÍÍ‹MŒËKŒÌŽÌÎKŒÍŒMŒÌËŒÍKŽMÍÎMˆ‹ŒÌÌMKŒÌÎNNMˆÍËŽLNŒËŒMÍNH‹MMÎ‹Œ‹ŒNŒÎHLŒÍLŒŽŒLLŽÎHÍL‹ÍÍLŒŒÍ‹ÌÍÌŽHLŒËŒÍNLMKKŒMÌHLÎKŽŒMÌ‹LËŽNˆÍMNMLÍM‹ÍLÈMKŒMLÎKNKŒÍLNM‹LNŒËŽLMMLÈÍMKMÍMMŒ‹KŒÍNMMMNL‹ÌLLÈLÎKŽMÌÎNNKŽŒŒNLÍLÍ‹ŒLMÌÌLŽÌNLLËŒÌŒLŽ‹ŽNLŽLˆLMŽMÌKŽKŽMÍŒHÍLLŽMÎNŽLŽMMÌÌHLËŒŒÍŒNKŽL‹ŽLÍÎNLËŒMÍLŽMÌÎLÌNHÍMKŒÍÌÌ‹ŽLËŒÌÌÈËŒŽMLŽLKŒNŒÍÌÈÎKŒŽMÎŒKŽLŒMHÍÌNKŽŽNMNŒKÌÌÍKŽŒˆL‹ÍŒŽŽËŽLÞˆLÎNŒLNNKNËŒŒŒHÍKŽMÌM‹NŒŽMŽNÎMNKŽNLMÍŒËŽLLMM‹NËMŒMŒÍL‹ŒÌLNKŽÌNLLËŒNÌÌNKNL‹NLŽMÈLŽMLÌLKNM‹ŽLŒÌÍŒÍÌÌLÎŒKŽLÌÌŒKÌŒNÌ‹Œ‹ŽLMËŒŒÎNMKŒLKŽÍMÌÌˆÍNMŽLŒM‹ŒÍHÎMËŽMÌMËŒMËŒÎÍˆÎLËŒÍÍÍLÌËŒMŽÍˆÌÎKMŒMÍËŒNŒMHÍŽKLÌNLŒKŒ‹ŒLÍMËŒŽLLM‹NM‹ŒÌMLHÌÍ‹ŽNMŒÌËNL‹ŒŒMŽHÍÍ‹ŽNMŒÎNKNKŒLMLˆÎËŒMLÍKN‹ŒÈÌÎLÌŒNŽLÌÍHÎMMŒ‹NŒNÍMÎNŒLNNKNËŒŒŒ^ˆLŽMŒŽÎLLÌKŒÎMLÈÌŽM‹ÎMÍËLŒ‹ŒMMÎMNHÌKŒÎËLMKŒMŒŽˆÌLKLNKLL‹ŽNLMHÌÌNKÍÌLL‹LLKŒLMŒÌËŒNLÍMËLËŒNMÌÍŽŒÍŒLŒŒŒŒÌÌÍKŽÌÎNLËŽMÌŒÌÍ‹ÌÍMNM‹LËŒMŒŒLÌÎŽŒLŒËLKŽMMˆÌÌÌ‹ŽNMMKNKŒŒLÍÌŽŒLNLÌ‹M‹LMÍHÌŒËŒŒMKLËŽMÍMÍŽHÌÌM‹ŽŒLLÎMˆÌM‹ŒÌMKŒÍÌÌNKMÌ‹ËŒLNMÎHÌÌŒKŽMÌ‹ÎŒŒÍÌÍˆÌŒMŽÌËMMŽÌËŒMÌÎŽMŽŒÌÌŽŽMÌÍŒËKŒMNMHÌÌKMNNL‹ŒŒMMÎLÌÍKŒÌMÌÎ‹ŒŒMÈÌÍLKÌLMMÍŽMÎÍˆÍŽÍŒL‹ËŒÌMŽMHÎKŒÎMÍL‹ŒLMŽÌÎKMÌÍNMŽMMÈÎKŽMLLËMËŒÍÍÎÎËLÍÍŒŽLKŽNÈÌÎ‹Í‹LËÌÌLÌŒÈÎŽNLÎLKŒŒLÎŒŒÍÌKLËŽNMNÌÎÍŽŒNKLNMLMLÈÍÌËŒNÌKLŒLŒÍˆÍŒ‹MÍŽNM‹LËŒŒÎHÌÍMËŒÌMMÍKLŽLŒÍL‹ŒŒLŽLËLÌŒÌŒMHÍËŒMNMËLÌ‹LNLMHÌÍKÍÎËLÌ‹ŽNNŒÌÍLMM‹LÌËŽŒÈÍKŽMLÌKLÍŽNÍÈÌÍLMÍLMËLÎŒLLNHÍLËŽLÌÍLKMŽNÌMÍNKŒÍNLNKMËÌÌŒMˆÌÍ‹ŒÍÍNNMËŒLÌÍÌŽÍ‹LŒËMKŒŒŒŽMŒHÍŒ‹ŽNMKMMKŽÌŒLÌHÌÍŒŒNLMMKMŒLLLMŽHÍNŒŒLKMKÌŒMÈÍMKŽLLMMŒMÌNNNMÌÍLKŒMLLÌKMŽKŒLŽLÈÍ‹ŒŒÍÍËMËŽMŒÍKÌLÌ‹MKŒMÌŽHÌÌŒÌNÎLMM‹ŒŒÎMNHÌLNÌËMKŒNˆŽMŒŽÎLLÌKŒÎMLÞˆLŒÌËŒLNÌKÎMËLŽMNÌŒÍËÌÍMÌËÎNKŒÍH‹LÌŒÎKÌÍŒŽN‹ŽLÌMK‹ŽNÌÌÍHÌNKŽMÌÍMËKNÎHÌ‹ÍÍŽL‹M‹ŒÎÍÈŽKŒŽÌÌŒËŒLÌŽÍÌŽLKNL‹ŽLÎŽL‹ŒÌLÍLËŽŽÌˆŽÌMŽNÍŽMŽNHÌŽËŽÌËÍ‹ŒÍÎMÈŽ‹ŽLŒÍËŽLMÍˆŽ‹MËÎKŒÍLHÌŽ‹ŽŽLŒNLÈÍÍÌ‹M‹LÌLŒËŒMÌÍKNKŒÌMLHÌNLLŒNÌÌÈLËŽLÍŒ‹ÍMLÎKŒNMHÌŒÎŽNNNMK‹ŽLÌMÍˆŒÍŽLKŒŽŒÈŒÌËŒLNÌKÎMËLŽMNˆMMMËŽMNŒNMKÍMÌÍMŒŒÎMKMMKŒŒMMˆLÎMŒŽKMŒNNÌŽLŽÎLM‹ŒMÌHÍLMÍ‹MNŽNLLÈLŽLŒÎËMLKŽMLHËŒMLL‹MŽMˆÍKÌMLÌ‹MKŽLÈKŒÌMMÌMŒŽÍMÈŒNLNLÍKŒMÌÍHÍŽLMÍ‹LÌËŒŽMŒH‹ŒÎŒLÌKÌŒÌÍÈ‹ŽLÎM‹LŽKŽŒÌNÍLŒÌÌLNŒMLLLˆNÎLËLLËŽMLHLKŒÍMÌKLLKŒŒMÌŽHÍLM‹ÌM‹LKŒÍLÈLŒËNLÍŽKLKŽLÌMMHLÌŽLŒÌŒ‹LËŒNNMŒMHÍLÌÎNLÌ‹L‹ÍMŒŽHLÌŽLNŒËL‹ŒMLMŒLHLÌKŒLLL‹LKŒÍNMÍLËŒÌLÌËNKÌMLŒËŒ‹MËÌÍLÈLNKŽLŽMMKŽLÍLMLÍL‹ŒLLËKMÌHLKŒÍMNLŽLNÈLMŒÍÌNÎKŒÍÌMLÍLM‹ŒŒMŽNÍKŒLÌˆLNŒŽNLÍÍËÌ‹ŒMŒMLˆLŒŒÌÌMŽŒÎMNLHÍLŒKŽNLŒKKŒŒÌLLLMŒŒLÌÎLËÍNLNKŽLÌLÈÍMŒÌËÍŒÍÌÌŽHMŒKNŒ‹ËŒÍÍŒˆMÎŒŒÍMNL‹ŒŒMLÈÍN‹ŒMÌËMŒŽNËŒLMKMËLŒMMNŽÎËLKŒÍŒŒÈÍMÎKNM‹LËŒMÍMHMÎŒÍŒLŽŒLMMÍËÍÍKL‹ŽNMˆÍMÌËŽNŽKLNÍNˆMKŒLŽÍMËLÌŒHMLËÍÍŒKLËÎMŒHÍMËŒŽÌËLŽKŒÍMMKŽNLŒ‹LÌKŽÍNMÍÈLÍ‹ŒNLÌÎLÌËŽMÎMÈÍLÍ‹ŒMŒÍMÍLÍŒLLLÍ‹ŒÍÍKLÍŽMMŒLÍKŽMÌNNKLÍKÎLÍÈÍMKLŒÍKLÎŒÌNŒMËNMMKŒNMMHML‹ŽMMŒMÍËMŒMLLHÍMMŽLÍNMKŒÍLMÈMM‹ŒÌÎMKMËÌÌMÈMMËŽMNŒNMKÍMÌˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LŒËŒÍÌŒKÌ‹ŒLÌŽÍÌŽKŒLŒLŒËŒËÌŽHÍKŒNMNMKÎNMHŽKLÍŒNMËŒŒÍHÌŽLËŒLÌLKL‹LŒMŽLËŒÎÍŽKL‹ÌˆŽËŒLŒLKŒËŽMŒLÈÌŽKŒÌNMŒLKËŒÌÍŒLŒHŽËÌMMŽKÌÎNÌHŽKŽLŽLŒKÍŒMŽÌÌÎKŒMŽMËÎLMHÍ‹ŽLMÌ‹ÎKŒMÎLHÌ‹LŽÎÍ‹ŽMMŒŽÌŽKMLMÍKŒÌLˆ‹ŒŒËÌËŽÍˆŒËŒÍÌŒKÌ‹ŒLÌŽÍˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LLKŽMNMKÌ‹LMNHÌM‹ŒÍNMËÍŒNNHŒKŒMÎN‹ÍKLLÍMLKŒLLLMKÎŒŒˆÌ‹NÌNÎKŒMÌŒÈ‹ŒÍŒÍÍÌËŒŒÍKŽMÌŽM‹KŒNÌKŒL‹ËMLÍÈŒËÍÍÍLËKŒNŽMLHŒ‹ŒMÍËLKŒÍNÌNŒNL‹KŒMNHMKŒÌLÎKÎŽLMŒˆLKŽMNMKÌ‹LMN^ˆLLKŒMNNÌKŒÌLÎÈÌLKÍ‹ÌKŒŒŒŽÈLKŒŽËÌKLÍÌHLKŽÌÌKŽLÌLÎMˆÌLKÌŒŒÍKÌKŽLÎÍLHLKÌŒÍËÌKÍMLLÈLKŒMNNÌKŒÌLÎÞˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆØ[YPÛÛ›Û\’XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“LŒŽMÈŒ˜ÌŒNŒŒÍKŒËMKŒŽŽKŽˆKŒK‹ŒÈKŒÍHËËÍHËŒ]ŽLXLËŒHËŒHKMKŽHKŒÎLKÍ‹LËLXLKŒHKŒHLKŒŒËKMXËKMËŒLËLKŒÍ‹ŒËL‹ŒM‹ŒÜËLK‹KŒML‹ŒM‹KŒØËKKKŒLKLHŒKLKŒŒËM[LKÍˆËLPLËŒHËŒHHHMËŽLUŒLØÌLËŒÎ‹MKŽKÍKMËŒKŒMKK‹KLKŒLÈKŒLKKËÈŒKÌKËLKŒÌˆKŒ‹LKÛ‹ŽLËKŒ˜ËKKŒHHŒˆKŒÍ‹ŒÍKŒÍÎÌHKŒŽŽM‹‹HËKŒËŽLËKŒÍKŒŽKŽKŒÍKKŒÌËŽ‹KHKŒÍ‹KŒÎ[‹ŽMŒ˜ËËŒMHKŒNKÎKŒNHKÖ“LŒËXLKHKHHKLÈKHKHHÈ“LMKHL˜LKHKHHLÈKHKHÖ“MHØLHHHˆŒZXLHHH’ÝŒXLHHHKLˆ‹LRLHHHHLšUÖˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ[[Y\[™Ú\Ù[XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LˆŒNUŒNKLHHHŒËKÛ‹L‹˜LHHHÌKKŒŽR›KNKKŽKKŽXLHHKKŒŒËKŒÍLKKLËÌØKKHHKK[ËÌÈKXLHHHŒÍŒŒ›LHHHKˆHXLHHHK›KNKNLHHHK›LKNKNLHHKLKˆMÈ[NH]‹NXLHHKKŒËÛL‹‹˜LHHKKÌKŒŽRËLHHKKËKŒÛK‹KLHHKKŒŽKKÌVˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“NŒŒÈLŒŒØËŒ‹Œ‹LKŒ‹ÈKŒËLKŒØKKHKÓ‹H[ŒËKŒØLHHLKKKKXËKŒ‹KŒ‹KKKŒËKËKŒŒ‹KËŒMLKŒMËKL‹ŒHK˜MKŒÍÈKŒÍÈLKˆ‹ŒXËKŒŒKŒËKŒŒKÛKXLHHKˆŒŽKKŒÈËÌÈËÌÖ“LLËÍÈMKŒ˜KKHÛKÌÈKÍK‹LHHŒMKŒN[KÌÈKÌØËŒKŒKŒ‹ŒKŒÍˆ‹L‹ËŒKKŒKŒKKŒˆKŒÍ“ŒŒHMËŒXLHHKŒ‹KŒMSMËHMK[LKÌËLKÌØKKHKÈLKŒÈKŒÖˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ\]ZXÛÜ™XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‹ŒÈ‹ˆ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LŒŒË‹˜ËMNŽMKLLMŒÍËLŒ‹ŽM‹LMM‹Œ‹MÌŒ‹ŽM‹ÌÍ‹ŒMŽÌKŒŒKÍ”ÌŒ‹ŽM‹LËŒÎKKÐÌL‹ŒÌËŒ‹MŒKÍKKŒ‹ŒŒËKŒœÌLMŒÍËŒ‹ŽM‹MM‹Œ‹MËŒLKMM‹Œ‹LŒ‹ŽM‹LMŒÍËMMM‹Œ˜ËMKŽKŽNMËŒLKLMM‹Œ‹“LŒŒËÎXËMÎŒKLM‹M‹ŒËŽMKLM‹M‹M‹MœÍŒËŽMKM‹M‹M‹M‹M‹M‹M‹M‹MŒËŽMKM‹M‹LM‹M‹MŒËŽMKLM‹M‹LM‹M‹LM‹M–ˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LÍŒËŒÍ‹Î˜ËMŒN‹LKŒLL‹ŒŒ‹LËŒ[LKŒÌËKØËLL‹ŒÌ‹M‹KLŒKŒMLMËŽL‹LŒNKLÌKLËŒKLLËÌ‹ŒËLŽŒMLÎKŒÌKNKŽ‹L‹ŒŒ‹ŽKŽKMMËLËŽMNLMKKŒŽKNKLKŒÍ‹LM‹ŽLËLËŒMËLKŒŒ[KŒKKŒM‹ŒŽKÌŽL]‹ŒL˜ËKŒÎËLKŽËMËMËŒKÌKLL‹ŽŽLËLÎL‹ŒÍËMŽKËŒÍËNŒKLM‹ŒLKŒÍLŒËÍKLËŽNLNKŒÍM‹KLÍKŒNLŒKŒNMËËLÎKŽ‹NËLNKNLËMŒ‹KŒŽMNKŒNKLKŒËLËŒ‹ÎŒ‹MËËŽMË‹ŽKLËÍŽNŒŒÍË‹ŽKLŒËËŒKŒŒ‹ŒÍ‹ŽËMKÛŒKŒKŒËNLŽKKKŒM‹KŒ˜ËL‹ŽNLÌËŽËMËŒMLËLLLŒMLËÎLKŒ˜ËMŒŒŽLLMŒLËÎŒŒKLLÌËŽNKMKŒKM‹‹NŽKLKÌK‹MŽL‹ÌK‹MKŒM‹LLŒËKŽËLMKŒ‹L‹ÛL‹ŽKŽXËLLËNML‹LŒK‹LNŽLËLNŒ‹LÌ‹ŽLKKMËÎŽ‹NLËÍËŒNLLŒKŒPÌLŒ‹MKM‹ËMÌŒŒËŒŒŽKÌM‹ŒKÌ‹ŒKKÌ‹ŒËKŒLKŽMËŽMMLŽKLËMŽŒM‹MŽKŒËMÍ‹Ì‹NKMKŒÌËM‹MMKŒL‹NMËÌËMŽKŒM‹LLKÌËŒL‹LNŽŒLšˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆ˜[œÙ›Ü›OH˜[œÛ]JÌNŽNLMKŽLŠH›Ý]JJH‚ˆH“LMÌKŽNML‹ŒÎZÌMË‹Ì‹MŒÍÌ‹ÌŒMM‹LMÌLMË‹MŒÍLÌ‹Ì‹LÌ–ˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ\Ù\’XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LLˆLMHN“LLKLÈLPNKLÈKLÈˆŒLØÌŽKˆKÈKÈKÚŒŒ˜ËŒKŒMËKKŒŽKLKŒL‹ŽL‹ŒMÈKŒÌ‹L‹ŽLKŒMKŒŒKËKŒKŒM[KŒˆ‹ŒXËKŒ‹ŒËŒ‹MKKMZLKØKKHKKM[KŒËL‹˜ËKŒ‹KŒ‹ŒËKŒÍËKKŒM‹ÍKŒÈKŽKŒÌˆ‹ŽKŒ‹ŒŒ‹KKZŒŒ˜ËŽHKËKˆKËLKÐNKLÈKLÈL‹ÈLZKŽMˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ[˜Ú[Ü\šÛRXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“M‹ŒÈ‹MXKŽKŽHLKˆKŒÍKŽMØLKKKKŽËŽÛKŽMËŒÍXKŽKŽHK›ŽMËŒÍXËŒÎŒMKŽKŽËŽÛŒÍKŽMØKŽKŽHKˆŒÍKKŽMØËŒMKKŒÎKKŽŽËKŽÛŽMËKŒÍXKŽKŽHLK›KŽMËKŒÍXLKKKKŽËKŽÛKŒÍKKŽMÖ“LLËŽMˆK›NNLHHKˆKŒÎLKŒÎLˆˆL‹Ž›LËŒNLËŒNLˆˆL‹ŽˆLKŒÎKŒÎLHHK–“L‹ŒLHŒŒM›ÌËMŒŒ˜LÈÈHŽËLKŒ[ËŽËMËŽØLHHHKˆNNLHHHK›MËŽÈËŽØLÈÈKLK‹ŽÛMŒŒËÌØLKHKHKLKÌËLKÌÖ“LNMKÌXLKŒHKŒHH‹ŒˆKŒËŒNKKMËŽKŒÈKŒÛKŒ˜ËŽMKŒÍKŽMHKÈ‹ŒLKŒ˜ËKKŒNKKŽMËLKŒÈKŒÛKˆKŒLKŒHKŒHKL‹ŒK‹LKŒLKŽKŽLKŒËLKŒÛLKŒK˜LKŒHKŒHHL‹ŒKŒK˜ËKKŒNKŽKMÈKŒËLKŒÛ‹LKŒˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ[[Y\’XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LKŒŒÈŒKŒLØLHHHLK[ËMËØËŒ‹KŒ‹LKKŒ‹È‹ŒLÈ‹ŒL˜ËŒ‹Œ‹Œ‹HÛMËËLHHKLKHLK‹LK–“MËÍˆËÍ›XLˆˆ‹ŽÈËMLËMLˆˆL‹ŽÛL‹ŽML‹ŽMKK˜LHHLKLKKLK˜LHHLKHK‹KL‹Ì‹L‹ÌXLˆˆL‹ŽÈËÍˆŽLØLˆˆ‹ŽÖˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆXÚY]™[Y[ÒXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LLËÍˆŽMØLHHKKÌËLKŒŒ[KL˜LHHHHKŽMKH˜LHHKLKŒŒKÌÖ“LNKŒˆËŽLHHHKLKHKXLHHHKLKLKKKLKXLHHHK“MËˆLKŒHKˆŒ˜LÈÈHŽ‹ŒM‹ŽKKŽËŽØLHHKLKˆKŒMËKŒMØLÈÈMŒKŒMËŒMØLHHKLKˆKŽËKŽÖ“M‹ŒHL‹È‹MËŽLˆˆŒZM˜LˆˆK‹LËŒ›LËŽKMKŒLËKŒËŒ˜LÈÈKMŒKŒMËKŒMØLHHLKˆKŒMËŒMØLÈÈKMŒKŒËKŒ–“MŽKŒ˜LHHHKLKKHKXLHHKLKKŽKŒ–“LŒKŽMÈŒ˜LHHKKÌÈKŒŒ[LˆXLHHHKKLKŽM‹KXLHHHKŒŒKÌÖ“L‹ÍˆKØLHHHHLKŽMˆXLHHHKKKŽML‹KV“LLŽMÈËÍ˜LHHKLKŽMKKL˜LHHHHKŽMKH–ˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÚÝ[XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH›LLËÈHŒËŒËKŒ‹ŽKŒHKŒÍKŒNŽMKŒMÈKŽˆ‹ÍKŽÎŒÍˆKKŽ‹ŒMK‹ÍËÈKŒÎKMHKŽ‹KŒËŽHKˆ‹ŒLÛŒK]ŒKŽËKŒËŒNKŒËŒÍKKŒKLØNŽHŽHKKH‹XËKŒMËKKŽKNKŒ‹KŒKŒNKKŒKŒÎM‹ŒKMˆKŒMKŒHK˜LËŽËŽKL‹Œˆ›K‹Œ˜KMMKŒØËŒKKKŒŽNKŒŽKØL‹N‹NKLKŒÍKŒŽËKŒ‹ŒKKKŒNKŒËŒXKŽŽKLKŒKKŽ]‹KŽZŒ‹KXKKHKŽKKŒÍ‹KHKŒMKŒÍŒKNKŽŽKKÎŽKXKŽŽKKŽKŽ‹LKNKKHKŽ‹KŒÍKKHKŒMŒÍ]ŒKŒØKŽŽKLKŒKŽËKŒÍ‹KŒKKËKŒ‹LKŒËK˜L‹Œˆ‹ŒˆKLKŒMËL‹Œ[KŒKNËKŒKKŒŽKKŒŒKKKKKMKLÈKLÈKLKŒËKŽËŒÈËŒÈKLKŒÎL‹ŒLˆKŒHKŒHHŒ‹LKŒ˜ËŒ‹KŒŒ‹KŒLKKŒÍ‹KŒ‹KLKKKÍ‹KËLKMËKŽKL‹LLÎHLÎHKKŒKLËŒØËŒ‹KŽNŒËLKŽMÌ‹L‹ŽØMËŒÍHËŒÍHHKŽ‹L‹HKHKHHL‹ŒØËËKŒˆK‹KŒÈ‹ŒMKŒÍKŒˆŒKŒËŒ‹KŒ‹–›KLKŒÍHLËŽLXKKŒÍŒM[KÍ‹ŽKŒÍKŽšKXK‹KŒËKŒKKL›KÍKKŽKKŒÍ‹KŒMV›MŒËM‹ŒL‹Žˆ‹ŽˆLËŒˆËH‹Žˆ‹ŽˆËH‹ŒŒXËŒHŒKKŒ‹ŒLËKŒÛŒKKŒZŒ›ŒM‹KŒËŒKŒ˜L‹Žˆ‹ŽˆËKŒÌ[ŒKŒØL‹ŽÈ‹ŽÈLËKNRNŒKŒËŒ‹KŒKŒKKŒŒKŒKŒKŒL‹Î‹ÎŒLKKŒŽ[ŒËKŒKŒËKŒLKŒKKŒËŒKKŒŒKKŒ˜L‹Žˆ‹ŽˆŒKK‹KŒKŒKKŒLËKŒKKŒXL‹ÍÈ‹ÍÈKŒKKŒÛKŒËKŒL˜L‹Žˆ‹ŽˆKŒKKŒŽKŒ‹KŒËKŒËKŒ˜L‹ŽÈ‹ŽÈK‹KÌ[KŒKŒKKŒKŒKKŒËKŒXL‹ŽÈ‹ŽÈKŒKKŒ[KŒËKŒXL‹Ž‹ŽKŒÍËKŒ[KŒKŒL‹Žˆ‹ŽˆKŒNKKŒSM‹Í[KŒKKŒ˜L‹Ž‹ŽKŒ‹KŒÚKŒXL‹Žˆ‹ŽˆKŒŒËKŒÚKŒ–›KM‹ŒŽŒŽL‹ŽH‹ŽHMŒHKŽN‹ŒÛKŒKŒ˜ËKŒ‹ŒKKŒ‹ŒŒKKŒËŒÌ‹ŒL‹Žˆ‹ŽˆŒŒ‹ŒL‹ŒŒËŒLÝ‹ŒÛŒKŒŒŒMÌŒŒ‹ŒËŒËŒL[Œ‹ŒL‹ŽH‹ŽHËŒŒHKŽŒKŒXL‹ŽMÈ‹ŽMÈŒNKKŒ›ŒKKŒØËŒŒËKŒ‹ŒLKKŒŒˆŒŒ‹KŒ›ŒËKŒXL‹Î‹ÎŒËKŒMŒKKŒKŒLËKŒŒËKŒØL‹ŽÈ‹ŽÈŒ‹KŒ›ŒËKŒËŒËKŒËŒ‹KŒ‹ŒKKŒKŒKŒKŒ‹KŒËŒ‹KŒKŒKŒKŒ‹KŒËŒKKŒKŒ‹KŒKŒËKŒ‹ŒËKŒLËŒ‹KŒØL‹ŽÈ‹ŽÈŒKŒ›ŒËKŒLKŒËKŒKŒ‹KŒKŒKKŒËŒKKŒ˜L‹Í‹ÍŒËKŒŒÝ‹KŒÛŒKKŒMÝ‹KŒL‹Ž‹ŽKŽLHKŒVˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÝX›PÚXÚÛX\šÒXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]š[H˜Ý\œ™[ÛÛÜˆ‚ˆH“LM‹ÈØLHHLKLKLËŒˆËŒLHHKˆK“M‹ÈÖ“LËÈLKŒØLHHLKKHXLHHKLKMKMVˆˆÏ‚ˆ]š[H˜Ý\œ™[ÛÛÜˆ‚ˆH“LŒKÈKØLHHLKLKLÈMKNLËŒËLËŒØLHHLKK›LHHKNˆˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÝ\‘š[Y
›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LLŽH‹Ž˜ËŒÎLKŒMH‹LKŒMH‹ŒÎKŽHKŽÚ‹ŒL˜ÌKŒˆKÌHKMÌÈ‹Œ[MŽMHËˆKŽHKŽ˜LKŒHKŒHKLKŽLÈKLˆNŒM›MŽMHË˜ËKŽNËL‹ŒËKŒKLKŽL‹LKKŽKMKŽ‹MŽMKLË˜LKŒHKŒHHÌËL‹ŒZ‹ŒL›KŽKMKŽÖˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÝ\“Ý][™Y
›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“L‹ŒÈLŽMLKŒHKŒHHÌËL‹ŒZ‹ŒL›KŽKMKŽØËŒÍËLKŒMH‹LKŒMH‹ŒÍÈKŽHKŽÚ‹ŒL˜ÌKŒˆKÌHKMÌÈ‹Œ[MŽMHËˆKŽHKŽ˜LKŒHKŒHKLKŽLÈKLˆNŒM›MŽMHË˜ËKŽNËL‹ŒËKŒKLKŽL‹LKKŽKMKŽ‹MŽMKLË–›LLKMKKŒZKŒ›MŒHËŒHKŒˆKMŒKLËŒKMŒHËŒHKŒ‹MKMŒKLËŒZKŒ›KŒ‹MHKŒˆVˆˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÙX\˜ÚXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“LMKŒˆMËŒØNHHHHKKLK[ŽØLHHKLKˆK›MËMŽ“LMÈLMÈÈHKLMÈÈHMˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÜšYÚ\œ›ÝÊ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“NXLHHšËNSKŒŽHMËŒØLHHHKˆKMÈ•ŒM˜LHHHˆ˜LHHLKLRˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÚXÚÛX\šÓ\™ÙP›ÛXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LŒKÈKŒØLHHHKLLˆL˜LHHKLKM‹M˜LHHHHKLKHM‹NLKŒËLLKŒØLHHHKˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ\™ÙP›ÛXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LNŽMŒKŒ˜LKHKHH‹ŒL‹L‹ŒL“MŒLˆL›‹ŽMM‹ŽMLKHKHHL‹ŒL‹L‹ŒL“LˆKŽKŒˆ‹ŽMLKHKHHL‹ŒLˆ‹ŒL“KŽL›M‹ŽM‹ŽMLKHKHH‹ŒLˆ‹ŒL“LˆMŒL›‹ŽM‹ŽMˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ[œÙ[™XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LÈ˜LHHLH]˜LHHHZ˜LHHL’KŒØNHHLËŒŽHŽ›KŒKŒXMËŽMÈËŽMÈKLKŽHKÎHHKŒHKØËŒNKKŒL‹ŒÍ‹KŒKLËKŒÎËKMKŒÌ‹LKŒMˆKŽKLKŽ[ŒKKŒPNKŽMHKŽMHŒˆLˆLL•ŒØLHHLKLV“LËŒNMŒ˜LHHKŒHKŒØËŒLKŒÌËŒŽMXLHHKŽKŽ˜ËKŒL‹KŒKŒŒ‹KKKŒÌ‹KÍXLHHLKŒËKŒV“MKŒÌÈNŒL˜LHHŒHKXËLKHKŒËŽHKÈKŒNLHHŽNLKÍŒˆŒˆKLKŒÌËKŽMHHHLKKŒV“LMŒMÈŒŽLHHLKŒL‹KŽÈŒŒKLKŽËŒÈHHHKŒˆKŽNHLŒHLŒH‹ŒÌ‹KŒÈHHŽËLKŒLÖˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[ÛˆÚ[™ÝÕÜÝ][™RXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“MXLHHHKLZLHHHH]‹ŒNLHHHˆXLÈÈLËLÒXLÈÈLÈÝŽLÈÈÈÚŒNLHHHL’XLHHKLKLUVˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“NLXLÈÈHËLÚLÈÈHÈÝŽLÈÈKLÈÚNLÈÈKLËLÝ‹N›LˆLHHHKLZLHHHH]ŽLHHKLHZNLHHKLKL]‹Nˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ›ÛÚÐÚXÚÒXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“LMH˜LÈÈHÈÝŒL’KXLKHKHÚMKKHKKUZXLHHHH]ŒMXLHHKLHRXLÈÈKLËLÕXLÈÈHËLÚL›KKŒÈKØLHHLKLKHLNL‹ŒËL‹ŒØLHHLKK›ÈØLHHKKMVˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ˜\ÚXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LMŒHXËHÍKŒÍÍKÍUŒÚKŒXËHÍKŒÍÍKÍ]‹XÌKKŒÍÍKKÍKÍRËÍPKÍKÍHHÈŒ]‹KXÌKKŒÍKÍKÍKKÍRUŒKÍXÌKKŒÍKÍKÍKKÍZVˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“MKŒˆØLHHLHKŒ›ÍˆL‹ŒLØLÈÈÈ‹ŽZŒÍ˜LÈÈËL‹Ž[ÍKLL‹ŒLØLHHLKLKŒ’KŒÖ“LLHL˜LHHHLˆ˜LHHHˆ‹M–›LËLXLHHHH]˜LHHHKLˆ‹M˜LHHHKLVˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ]XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LM‹‹ŽM˜ËŒŽHLKŒKËMKŽˆ‹ŒÍËKŒ‹ŒKŒËŒ‹KŒËŒÍÌKŒŽKŒËŽHKŒËHŽMKŒŒHKŒÍ‹KŒËËK‹ÍËLHKŒ‹LKÌ‹Œ‹KÍKŒÎLKMËŒÎL‹LKŒÍKKŒŽKL‹MKŽËLËM˜MKŽLˆKŽLˆL‹KL‹ŒÍHËŽËŽLËŒKKŽØËLKMHL‹ŽM‹ŒÍËMŒŒˆKŒXMËˆËˆL‹ŽMˆËŒÈKLÈKLÈLKŒH˜ÌKKŒˆ‹ÍËÎËŽMXM‹ŒÈ‹ŒÈ‹È‹ŽHŒÈŒÈŒÍˆKŒHL‹ÈL‹ÈKŒÍKLKŒNKHHËŒˆKŒØËŒKŒŒ‹Œ‹ËKŒNKNKKÍËËLKŽKÍËL‹ÍHKŒ‹LKŒŒËŒËL‹LËÍ‹L‹ŒNMKMKLKŒÌØNŒHŒHKLËŒËLËMÈLKŽLÈLKŽLÈKLKŒËMKŒL˜ÌL‹ŒËMŒNHKMKŽNKÈKÈHËŽ‹LËŽÌKŒ‹KŽHËLKŒÍKŒÍ‹LKŒÍKŽËŒÍÈŽKŒLˆKÌˆ‹HKÍˆËŒŽËŒXNŽˆŽˆHKŒMˆM˜ÌKŒÍ‹KŒŒÈ‹MËKÈËMKŽHKŽHKLKŽLˆ‹ØËKŽ‹NLKÍ‹ŽËL‹ŽKŽØL‹‹KLK‹KXËKKŒÍKKKKÎKÌËLKŒÌ‹KŒËMKKÍKLKŒÍˆKŒÍMŒÈŒÈKL‹ŒËLËËHMÍËŒÌÈMKŒMˆÈMÈL‹XÌLKŒMŒ‹L‹ŒM‹‹LËŒKËKŽHKLKMÈKÌËL‹Œ˜MŒÈŒÈHŒËKŒÌXËËŒŽKŽ‹ŽKŒÈKŒM›ŒËKŽMXËŒ‹KŒ‹ŒKKŒÌË‹KŒÌÚKŒ–›KMKŒˆŒËŽKKKŒÍHKŽMËLKŒLKKËÍËLK‹ÍËL‹ÈKŽKŒNLKM‹KLËL‹ŒØLKÍˆKÍˆLKKKÌØËKŽLKKŒÍKLKŽMÈKŒMŒŽŒŽKÎ‹ØÌŽKŒMÈKNLH‹Œ‹ŒÍ‹KŽËÌÈKLËÌÖˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ^XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“LLŽNHËŒMLHHHH‹ŽŒMHLHHšËŽ›KÈØLHHHšËŽ›KŽŽLHHKŽMËŒÌ“ŽHMšŽMÛKŽŽLHHKŽMËŒÌ›Ž‹MKŒM’ŒLHHHLšLËŽ›ËMŒXLHHHLšLËŽ›ŽMŽLHHHLKŽMËKŒÌ“MKŒMHMŽMÛŽMŽ“LMŒMHMËMKŽ[KÈŽMÖˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆš\™RXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆš[[OH™]™[›Ù‚ˆH“LÈMNHHHNÌL‹ŒËKŒKMKŒŒ‹LKÎKMËNNŒˆŒÎKËÈLKŒËŒNKÎËŽXK‹ˆKLKŒËŒLSL‹ŒŒˆK˜KŽKŽHLKKŒÌÛMŒˆŒLL‹ŒÈL‹ŒÈÈM›NKŒ‹KŽKMËMÈLKKŒŒÓKˆMXLËŒËŒHKŒL‹ËKŒMKŒ‹KKKŒŽKÌKKŒ“LÈM‹[KÍLËŒÍˆ‚ˆÛ\[OH™]™[›Ù‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ™[Z^XÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“MˆØLHHHKLZ˜LHHHH]˜LHHHKLˆK[M‹‹MˆˆMKŒÍUŒMØLÈÈÈÈHHHHˆHHKMKM]‹LK˜ÌLKÍ‹ËLËˆKŽMKMÓLNHØLHHKLKLVˆ‚ˆÏ‚ˆ]ˆš[^Ü›ÜË™š[˜Ý\œ™[ÛÛÜˆŸBˆH“LNŒXLHHKLHZM˜LHHKLKL]‹M˜LHHHHˆŒËN[‹M‹MˆˆŒUØLÈÈLËLÈHHHHLˆHHHH]ŒK˜ÌKÍ‹KÈË‹LKŽMHÓLËHŒMØLHHHHVˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB‚™^Ü[˜Ý[Ûˆ\ØYXÛÛŠ›ÜÎˆXÛÛ”›ÜÊHÂˆ™]\›ˆ
ˆXÛÛ‚ˆË‹‹œ›ÜßBˆšY]Ð›ÞHŒ‚ˆ‚ˆ]ˆš[H˜Ý\œ™[ÛÛÜˆ‚ˆH“LLˆŒØLLHLHHLŒˆLHLHŒ–›LLMØLHHHH]LHHHHšMLHHHKLˆ‹MØLHHHHLšØLHHHKLVˆ‚ˆÏ‚ˆÒXÛÛ‚ˆ
NÂŸB