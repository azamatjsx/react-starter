import { formatForDisplay, useHotkeyRegistrations } from "@tanstack/react-hotkeys";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import { Kbd, KbdGroup } from "@/shared/ui/kbd";

type ShortcutsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/** Lists every hotkey registered anywhere in the app, so new ones show up automatically. */
export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
    const registrations = useHotkeyRegistrations().filter((reg) => reg.options.meta?.name);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Keyboard shortcuts</DialogTitle>
                    <DialogDescription>
                        Letters joined by "then" are pressed one after another.
                    </DialogDescription>
                </DialogHeader>
                <ul>
                    {registrations.map((reg) => (
                        <li key={reg.id} className="flex items-center justify-between gap-4 py-1">
                            <span>{reg.options.meta?.name}</span>
                            <KbdGroup>
                                {toKeys(reg.hotkey).map((key, index) => (
                                    <span key={index} className="flex items-center gap-1">
                                        {index > 0 && (
                                            <span className="text-muted-foreground">then</span>
                                        )}
                                        <Kbd>{key}</Kbd>
                                    </span>
                                ))}
                            </KbdGroup>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}

/** A chord ("Mod+/") is one key label; a sequence (["G", "H"]) is one label per step. */
function toKeys(hotkey: Parameters<typeof formatForDisplay>[0]): string[] {
    return Array.isArray(hotkey)
        ? hotkey.map((step) => formatForDisplay(step))
        : [formatForDisplay(hotkey)];
}
