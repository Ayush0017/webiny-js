import React from "react";
import { Input, InputProps } from "~/Input";
import { Chips, Chip } from "../Chips";
import { FormComponentProps } from "~/types";
import { css } from "emotion";
import keycode from "keycode";
import { ReactComponent as BaselineCloseIcon } from "./icons/baseline-close-24px.svg";
import { FormElementMessage } from "~/FormElementMessage";
import { SyntheticEvent } from "react";

type TagsProps = FormComponentProps & {
    /**
     * Component label.
     */
    label?: string;

    /**
     * Are input and chosen tags disabled?
     */
    disabled?: boolean;

    /**
     * Placeholder text for the form control. Set to a blank string to create a non-floating placeholder label.
     */
    placeholder?: string;

    /**
     * Description beneath the input.
     */
    description?: string;

    /**
     * A className for the root element.
     */
    className?: string;

    /**
     * Default structure of value, an object consisting of "id" and "name" keys. Different keys can be set using "valueProp" and "textProp" props.
     */
    value?: { id: string; name: string };

    /**
     * Callback that gets executed on change of input value.
     */
    onInput?: Function;

    /**
     * Callback that gets executed when the input is focused.
     */
    onFocus?: Function;

    /**
     * Automatically focus on the tags input.
     */
    autoFocus?: boolean;
};

interface TagsState {
    inputValue: string;
}

const tagsStyle = css({
    position: "relative",
    ".mdc-elevation--z1": {
        position: "absolute",
        width: "calc(100% - 2px)",
        left: 1,
        top: 56,
        zIndex: 10,
        maxHeight: 200,
        overflowY: "scroll",
        backgroundColor: "var(--mdc-theme-surface)"
    },
    ul: {
        listStyle: "none",
        width: "100%",
        padding: 0,
        li: {
            padding: 10
        }
    }
});

export class Tags extends React.Component<TagsProps, TagsState> {
    public override state = {
        inputValue: ""
    };

    public override render() {
        const { validation, value, disabled, onChange, description, ...otherInputProps } =
            this.props;

        const inputProps: InputProps = {
            ...otherInputProps,
            value: this.state.inputValue,
            onChange: (inputValue: string) => {
                this.setState({ inputValue });
            },
            onKeyDown: (ev: SyntheticEvent) => {
                if (!onChange) {
                    return;
                }

                const newValue = Array.isArray(value) ? [...value] : [];
                const inputValue = this.state.inputValue || "";
                /**
                 * We must cast as keycode only works with Event | string type.
                 */
                switch (keycode(ev as unknown as Event)) {
                    case "enter":
                        if (inputValue) {
                            newValue.push(inputValue);
                            onChange(newValue);
                            this.setState({ inputValue: "" });
                        }
                        break;
                    case "backspace":
                        if (newValue.length && !inputValue) {
                            newValue.splice(-1, 1);
                            onChange(newValue);
                            break;
                        }
                }
            }
        };

        const { isValid: validationIsValid, message: validationMessage } = validation || {};

        return (
            <div className={tagsStyle}>
                <div>
                    <Input {...inputProps} />

                    {validationIsValid === false && (
                        <FormElementMessage error>{validationMessage}</FormElementMessage>
                    )}
                    {validationIsValid !== false && description && (
                        <FormElementMessage>{description}</FormElementMessage>
                    )}

                    {Array.isArray(value) && value.length ? (
                        <Chips disabled={disabled}>
                            {value.map((item, index) => (
                                <Chip
                                    label={item}
                                    trailingIcon={<BaselineCloseIcon />}
                                    key={`${item}-${index}`}
                                    onRemove={() => {
                                        // On removal, let's update the value and call "onChange" callback.
                                        if (onChange) {
                                            const newValue = [...value];
                                            newValue.splice(index, 1);
                                            onChange(newValue);
                                        }
                                    }}
                                />
                            ))}
                        </Chips>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default Tags;
