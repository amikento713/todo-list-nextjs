"use client";

import styles from "../styles/Todo.module.css";

interface EditTaskFormProps {
    text: string;
    deadline: string;

    onTextChange: (
        value: string
    ) => void;

    onDeadlineChange: (
        value: string
    ) => void;

    onSave: () => void;

    onCancel: () => void;
}

export default function EditTaskForm({
    text,
    deadline,
    onTextChange,
    onDeadlineChange,
    onSave,
    onCancel,
}: EditTaskFormProps) {
    return (
        <div className={styles.editContainer}>
            <input
                type="text"
                value={text}
                onChange={(e) =>
                    onTextChange(
                        e.target.value
                    )
                }
                className={styles.editInput}
            />

            <input
                type="date"
                value={deadline}
                onChange={(e) =>
                    onDeadlineChange(
                        e.target.value
                    )
                }
                className={
                    styles.editDateInput
                }
            />

            <div
                className={
                    styles.actionButtons
                }
            >
                <button
                    className={
                        styles.saveButton
                    }
                    onClick={onSave}
                >
                    Save
                </button>

                <button
                    className={
                        styles.cancelButton
                    }
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}