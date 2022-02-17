import React from "react";
import debounce from "lodash/debounce";
import NewRefEntryFormDialog, { NewEntryButton } from "./NewRefEntryFormDialog";
import { AutoComplete } from "@webiny/ui/AutoComplete";
import { i18n } from "@webiny/app/i18n";
import { Link } from "@webiny/react-router";
import { useNewRefEntry } from "../hooks/useNewRefEntry";
import { useReference } from "./useReference";
import { renderItem } from "./renderItem";
import { createEntryUrl } from "./createEntryUrl";
import { CmsEditorField } from "~/types";
import { BindComponentRenderProp } from "@webiny/form";

const t = i18n.ns("app-headless-cms/admin/fields/ref");

const unpublishedLabel = t`Selected content entry is not published. Make sure to {publishItLink} before publishing the main content entry.`;
const publishedLabel = t`Selected content entry is published. You can view it {here}.`;

interface ContentEntriesAutocompleteProps {
    bind: BindComponentRenderProp;
    field: CmsEditorField;
}
const ContentEntriesAutocomplete: React.FC<ContentEntriesAutocompleteProps> = ({ bind, field }) => {
    const { options, setSearch, value, loading, onChange } = useReference({
        bind,
        field
    });

    let entryInfo: string | null = null;
    if (value && !value.published) {
        const link = createEntryUrl(value);
        entryInfo = unpublishedLabel({ publishItLink: <Link to={link}>{t`publish it`}</Link> });
    } else if (value) {
        const link = createEntryUrl(value);
        entryInfo = publishedLabel({
            here: <Link to={link}>{t`here`}</Link>
        });
    }
    const { renderNewEntryModal, refModelId, helpText } = useNewRefEntry({ field });

    /*
     * Wrap AutoComplete input in NewRefEntry modal.
     */
    if (renderNewEntryModal) {
        return (
            <NewRefEntryFormDialog
                modelId={refModelId}
                onChange={entry => onChange(entry, entry as any)}
            >
                <AutoComplete
                    {...bind}
                    renderItem={renderItem}
                    onChange={onChange}
                    loading={loading}
                    value={value || undefined}
                    options={options}
                    label={field.label}
                    description={
                        <>
                            {field.helpText}
                            {entryInfo}
                        </>
                    }
                    onInput={debounce(search => setSearch(search), 250)}
                    noResultFound={<NewEntryButton />}
                />
            </NewRefEntryFormDialog>
        );
    }

    return (
        <AutoComplete
            {...bind}
            renderItem={renderItem}
            onChange={onChange}
            loading={loading}
            value={value || undefined}
            options={options}
            label={field.label}
            description={
                <>
                    {field.helpText}
                    {entryInfo}
                </>
            }
            onInput={debounce(search => setSearch(search), 250)}
            noResultFound={helpText}
        />
    );
};

export default ContentEntriesAutocomplete;
