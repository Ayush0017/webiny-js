import { CmsEditorContentModel, CmsEditorField, CmsFieldValueTransformer } from "~/types";
import { plugins } from "@webiny/plugins";

interface AvailableFieldTransformers {
    [fieldType: string]: CmsFieldValueTransformer;
}

interface FieldTransformers {
    [fieldId: string]: (value: any) => any;
}

const getAvailableTransformerPlugins = (): AvailableFieldTransformers => {
    return plugins
        .byType<CmsFieldValueTransformer>("cms-field-value-transformer")
        .reduce((transformers, pl) => {
            const fieldTypes = Array.isArray(pl.fieldType) ? pl.fieldType : [pl.fieldType];
            for (const fieldType of fieldTypes) {
                if (transformers[fieldType]) {
                    console.warn(
                        `Transformer for field type "${fieldType}" is already defined. There cannot be more than one transformer.`
                    );
                    continue;
                }
                transformers[fieldType] = pl;
            }
            return transformers;
        }, {} as Record<string, CmsFieldValueTransformer>);
};

interface TransformerCallable {
    (value: any): any;
}
const createTransformers = (fields: CmsEditorField[]): FieldTransformers => {
    const transformerPlugins = getAvailableTransformerPlugins();
    const transformers: Record<string, TransformerCallable> = {};
    for (const field of fields) {
        if (!transformerPlugins[field.type]) {
            continue;
        }
        // TODO @ts-refactor figure out if possible to put some type instead of any
        transformers[field.fieldId] = (value: any) => {
            return transformerPlugins[field.type].transform(value, field);
        };
    }
    return transformers;
};

export const prepareFormData = (
    input: Record<string, any>,
    model: CmsEditorContentModel
): Record<string, any> => {
    const transformers = createTransformers(model.fields);

    return Object.keys(transformers).reduce((output, key) => {
        const value = input[key];
        const transform = transformers[key];

        const transformedValue = transform(value);
        if (transformedValue === undefined) {
            return output;
        }
        output[key] = transformedValue;

        return output;
    }, input);
};
