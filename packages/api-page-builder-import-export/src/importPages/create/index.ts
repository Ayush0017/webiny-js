import { HandlerPlugin } from "@webiny/handler/types";
import { ArgsContext } from "@webiny/handler-args/types";
import {
    PageImportExportTask,
    PageImportExportTaskStatus,
    PbPageImportExportContext
} from "~/types";
import { initialStats, readExtractAndUploadZipFileContents } from "~/importPages/utils";
import { invokeHandlerClient } from "~/importPages/client";
import { HandlerArgs as ProcessHandlerArgs } from "../process";
import { SecurityIdentity } from "@webiny/api-security/types";
import { mockSecurity } from "~/mockSecurity";
import { zeroPad } from "@webiny/utils";

export interface HandlerArgs {
    category: string;
    zipFileKey?: string;
    zipFileUrl?: string;
    task: PageImportExportTask;
    identity: SecurityIdentity;
}

interface HandlerResponseError {
    message: string;
}
export interface HandlerResponse {
    data: string | null;
    error: HandlerResponseError | null;
}

interface Configuration {
    handlers: {
        process: string;
    };
}

/**
 * Handles the import page workflow.
 */
export default (
    configuration: Configuration
): HandlerPlugin<PbPageImportExportContext, ArgsContext<HandlerArgs>> => ({
    type: "handler",
    async handle(context): Promise<HandlerResponse> {
        const log = console.log;

        try {
            log("RUNNING Import Pages Create");
            const { invocationArgs: args, pageBuilder } = context;
            const { task, category, zipFileKey, zipFileUrl, identity } = args;
            if (!zipFileKey && !zipFileUrl) {
                return {
                    data: null,
                    error: {
                        message:
                            "Missing zipFileKey and zipFileUrl parameters. One must be defined."
                    }
                };
            }
            mockSecurity(identity, context);
            // Step 1: Read the zip file
            const pageImportDataList = await readExtractAndUploadZipFileContents(
                zipFileKey || (zipFileUrl as string)
            );
            // Once we have map we can start processing each page

            // For each page create a sub task and invoke the process handler
            for (let i = 0; i < pageImportDataList.length; i++) {
                const pagesDirMap = pageImportDataList[i];
                // Create sub task
                const subtask = await pageBuilder.pageImportExportTask.createSubTask(
                    task.id,
                    zeroPad(i + 1, 5),
                    {
                        status: PageImportExportTaskStatus.PENDING,
                        data: {
                            pageKey: pagesDirMap.key,
                            category,
                            zipFileKey,
                            zipFileUrl,
                            input: {
                                fileUploadsData: pagesDirMap
                            }
                        }
                    }
                );
                log(`Added SUB_TASK "${subtask.id}" to queue.`);
            }
            // Update main task status
            await pageBuilder.pageImportExportTask.updateTask(task.id, {
                status: PageImportExportTaskStatus.PROCESSING,
                stats: initialStats(pageImportDataList.length)
            });

            await invokeHandlerClient<ProcessHandlerArgs>({
                context,
                name: configuration.handlers.process,
                payload: {
                    taskId: task.id,
                    // Execute "Process" for the first sub task.
                    subTaskIndex: 1,
                    identity: context.security.getIdentity()
                }
            });
        } catch (e) {
            log("[IMPORT_PAGES_CREATE] Error => ", e);

            /**
             * In case of error, we'll update the task status to "failed",
             * so that, client can show notify the user appropriately.
             */
            const { invocationArgs: args, pageBuilder } = context;
            const { task } = args;

            await pageBuilder.pageImportExportTask.updateTask(task.id, {
                status: PageImportExportTaskStatus.FAILED,
                error: {
                    name: e.name,
                    message: e.message,
                    code: e.code || "EXPORT_FAILED"
                }
            });

            return {
                data: null,
                error: {
                    message: e.message
                }
            };
        }

        return {
            data: "",
            error: null
        };
    }
});
