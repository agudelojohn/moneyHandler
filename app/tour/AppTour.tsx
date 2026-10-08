"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { findVisibleTarget, TOUR_STEPS } from "./steps";
import * as Sx from "./styles";

type AppTourProps = {
    open: boolean;
    index: number;
    onNext: () => void;
    onBack: () => void;
    onClose: () => void;
};

type Hole = { top: number; left: number; width: number; height: number };

export function AppTour({ open, index, onNext, onBack, onClose }: AppTourProps) {
    const { t } = useI18n();
    const step = TOUR_STEPS[index] ?? TOUR_STEPS[0];
    const copy = tourCopy(t.tour, step.id);
    const [hole, setHole] = useState<Hole | null>(null);
    const targetKey = step.targets.join("|");
    const isFirst = index === 0;
    const isLast = index === TOUR_STEPS.length - 1;

    useEffect(() => {
        if (!open) {
            return;
        }

        let scrolledFor = "";
        const measure = () => {
            const target = findVisibleTarget(step.targets);
            if (!target) {
                setHole(null);
                return;
            }
            if (scrolledFor !== targetKey) {
                target.scrollIntoView({ block: "center", inline: "nearest" });
                scrolledFor = targetKey;
            }
            const rect = target.getBoundingClientRect();
            const pad = 8;
            setHole({
                top: Math.max(8, rect.top - pad),
                left: Math.max(8, rect.left - pad),
                width: rect.width + pad * 2,
                height: rect.height + pad * 2,
            });
        };

        measure();
        const intervalId = window.setInterval(measure, 300);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, true);
        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", measure, true);
        };
    }, [open, targetKey, step.targets]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onClick = (event: MouseEvent) => {
            const target = findVisibleTarget(step.targets);
            if (!target || !target.contains(event.target as Node)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            onNext();
        };

        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, [open, step.targets, onNext]);

    if (!open) {
        return null;
    }

    const cardStyle = placeCard(hole);

    return (
        <>
            {hole ? <Shade hole={hole} /> : <Stack sx={{ ...Sx.tourShadeSx, inset: 0 }} />}
            {hole ? (
                <Stack
                    sx={Sx.tourRingSx}
                    style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
                />
            ) : null}
            <Stack sx={Sx.tourCardSx} style={cardStyle} role="dialog" aria-labelledby="app-tour-title">
                <Typography id="app-tour-title" variant="h6">
                    {copy.title}
                </Typography>
                <Typography sx={Sx.tourProgressSx}>
                    {t.tour.step} {index + 1} {t.tour.of} {TOUR_STEPS.length}
                </Typography>
                <Typography sx={Sx.tourBodySx}>{copy.body}</Typography>
                <Typography sx={Sx.tourProgressSx}>{t.tour.clickHint}</Typography>
                <Stack sx={Sx.tourActionsSx}>
                    <Button onClick={onClose} sx={Sx.tourSkipButtonSx}>
                        {t.tour.skip}
                    </Button>
                    <Stack sx={Sx.tourNavButtonsSx}>
                        <Button onClick={onBack} disabled={isFirst} sx={Sx.tourSkipButtonSx}>
                            {t.tour.back}
                        </Button>
                        <Button variant="contained" onClick={onNext} sx={Sx.tourNextButtonSx}>
                            {isLast ? t.tour.done : t.tour.next}
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}

function Shade({ hole }: { hole: Hole }) {
    const right = Math.max(0, window.innerWidth - (hole.left + hole.width));
    const bottom = Math.max(0, window.innerHeight - (hole.top + hole.height));
    return (
        <>
            <Stack sx={Sx.tourShadeSx} style={{ top: 0, left: 0, right: 0, height: hole.top }} />
            <Stack sx={Sx.tourShadeSx} style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }} />
            <Stack sx={Sx.tourShadeSx} style={{ top: hole.top, right: 0, width: right, height: hole.height }} />
            <Stack sx={Sx.tourShadeSx} style={{ left: 0, right: 0, bottom: 0, height: bottom }} />
        </>
    );
}

function placeCard(hole: Hole | null): { top: number; left: number } {
    const width = Math.min(360, window.innerWidth - 24);
    if (!hole || hole.height > window.innerHeight * 0.45) {
        return {
            top: Math.max(16, window.innerHeight - 240),
            left: Math.max(12, (window.innerWidth - width) / 2),
        };
    }

    const margin = 12;
    let top = hole.top + hole.height + margin;
    if (top + 220 > window.innerHeight) {
        top = Math.max(margin, hole.top - 220);
    }
    let left = hole.left;
    if (left + width > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - width - margin);
    }
    return { top, left };
}

function tourCopy(
    tour: {
        welcomeTitle: string;
        welcomeBody: string;
        modulesTitle: string;
        modulesBody: string;
        categoriesTitle: string;
        categoriesBody: string;
        recordTitle: string;
        recordBody: string;
        dailyTitle: string;
        dailyBody: string;
        staticPaymentsTitle: string;
        staticPaymentsBody: string;
        deductionsTitle: string;
        deductionsBody: string;
        expensesTitle: string;
        expensesBody: string;
        expensesFormTitle: string;
        expensesFormBody: string;
    },
    id: string,
) {
    const table: Record<string, { title: string; body: string }> = {
        welcome: { title: tour.welcomeTitle, body: tour.welcomeBody },
        modules: { title: tour.modulesTitle, body: tour.modulesBody },
        categories: { title: tour.categoriesTitle, body: tour.categoriesBody },
        record: { title: tour.recordTitle, body: tour.recordBody },
        daily: { title: tour.dailyTitle, body: tour.dailyBody },
        staticPayments: { title: tour.staticPaymentsTitle, body: tour.staticPaymentsBody },
        deductions: { title: tour.deductionsTitle, body: tour.deductionsBody },
        expenses: { title: tour.expensesTitle, body: tour.expensesBody },
        expensesForm: { title: tour.expensesFormTitle, body: tour.expensesFormBody },
    };
    return table[id] ?? table.welcome;
}
