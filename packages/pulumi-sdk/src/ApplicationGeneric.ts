import { LocalWorkspace } from "@pulumi/pulumi/automation";
import { Pulumi } from "./Pulumi";
import { PulumiApp } from "./PulumiApp";
import { ApplicationConfig, ApplicationHook } from "./ApplicationConfig";

export interface ApplicationGenericConfig extends ApplicationConfig {
    app: PulumiApp;
}

interface StackArgs {
    /** Root path of the application */
    root: string;
    env: string;
    pulumi: Pulumi;
    debug?: boolean;
}

export class ApplicationGeneric implements Readonly<ApplicationConfig> {
    public readonly id: string;
    public readonly name: string;
    public readonly description?: string;
    public readonly cli?: Record<string, any>;
    public readonly beforeBuild?: ApplicationHook;
    public readonly afterBuild?: ApplicationHook;
    public readonly beforeDeploy?: ApplicationHook;
    public readonly afterDeploy?: ApplicationHook;

    constructor(private readonly config: ApplicationGenericConfig) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.cli = config.cli;
        this.beforeBuild = config.beforeBuild;
        this.afterBuild = config.afterBuild;
        this.beforeDeploy = config.beforeDeploy;
        this.afterDeploy = config.afterDeploy;
    }

    public async createOrSelectStack(args: StackArgs) {
        const PULUMI_SECRETS_PROVIDER = process.env.PULUMI_SECRETS_PROVIDER;

        const stack = await LocalWorkspace.createOrSelectStack(
            {
                projectName: this.name,
                stackName: args.env,
                program: () => this.config.app.run()
            },
            {
                workDir: args.root,
                projectSettings: {
                    name: this.name,
                    runtime: "nodejs",
                    description: this.description
                },
                secretsProvider: PULUMI_SECRETS_PROVIDER,
                pulumiHome: args.pulumi.pulumiFolder,
                envVars: {
                    WEBINY_ENV: args.env,
                    WEBINY_PROJECT_NAME: this.name,
                    // Add Pulumi CLI path to env variable, so the CLI would be properly resolved.
                    PATH: `${args.pulumi.pulumiFolder};${process.env.PATH ?? ""}`
                }
            }
        );

        return {
            async refresh() {
                return await stack.refresh({ onOutput: console.info });
            },
            async preview() {
                return await stack.preview({ onOutput: console.info });
            },
            async up() {
                return await stack.up({ onOutput: console.info });
            }
        };
    }
}

export function createGenericApplication(config: ApplicationGenericConfig) {
    return new ApplicationGeneric(config);
}