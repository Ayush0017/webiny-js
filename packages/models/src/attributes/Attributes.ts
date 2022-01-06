import WebinyError from "@webiny/error";
import { Attribute } from "~/types";
import { Attribute as AttributeImpl } from "./Attribute";

export interface AttributeMap {
    [key: string]: Attribute;
}

export class Attributes {
    public readonly items: AttributeMap = {};

    public constructor(items: Attribute[] = []) {
        this.addAttributes(items);
    }
    /**
     * We always want to have class instance in the attributes list.
     * That is why we run a check if attribute value sent is instance of Attribute implementation.
     */
    public addAttributes(items: Attribute[]): void {
        for (const attr of items) {
            this.addAttribute(attr);
        }
    }

    public addAttribute(attr: Attribute): void {
        if (!!this.items[attr.name]) {
            throw new WebinyError(`Attribute "${attr.name}" already exists.`, "ATTRIBUTE_EXISTS", {
                attribute: attr
            });
        }
        /**
         * We always want to have class instance in the attributes list.
         * That is why we run a check if attribute value sent is instance of Attribute implementation.
         */
        if (attr instanceof AttributeImpl === true) {
            this.items[attr.name] = attr;
            return;
        }
        /**
         * If it is not, make the instance.
         */
        this.items[attr.name] = new AttributeImpl(attr);
    }

    public getAttributes(): AttributeMap {
        return this.items;
    }

    public removeAttribute(attr: Attribute | string): void {
        const name = this.getName(attr);
        if (this.hasAttribute(name) === false) {
            return;
        }
        delete this.items[name];
    }

    public hasAttribute(attr: Attribute | string): boolean {
        const name = this.getName(attr);
        return !!this.items[name];
    }

    private getName(value: Attribute | string): string {
        if (typeof value === "string") {
            return value;
        } else if (
            (value && typeof value === "object" && !!value.name) ||
            value instanceof AttributeImpl
        ) {
            return value.name;
        }
        throw new WebinyError(
            "Value is not either an Attribute object or a string. Cannot determine Attribute name.",
            "INVALID_VALUE",
            {
                value
            }
        );
    }
}
