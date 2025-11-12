import config from 'config';

class ConfigValidationError extends Error {
	message: string;
	errors?: string[];
	constructor(message: string, errors?: string[]) {
		super(message);
		this.message = message;
		if (errors) {
			this.errors = errors;
		}
	}
}

export const validateEnvironment = () => {
	const envVars = ['CT_API_CLIENT', 'CT_AUTH_URL', 'CT_API_URL', 'CT_PROJECT_ID', 'KLAVIYO_AUTH_KEY'];
	const errors: string[] = [];

	for (const envVar of envVars) {
		if (!process.env[envVar]) {
			errors.push(`Environment variable "${envVar}" is empty or undefined.`);
		}
	}

	if (process.env.CT_API_CLIENT) {
		try {
			JSON.parse(process.env.CT_API_CLIENT);
		} catch (error) {
			errors.push(`Could not parse CT_API_CLIENT credentials object. Error: ${error}`);
		}
	}

	if (errors.length) {
		throw new ConfigValidationError(
			'Could not validate required environment variables on startup. Please check your environment file and try again.',
			errors,
		);		
	}

};

export const validateDeduplicationConfig = () => {
	const errors: string[] = [];

	// Check if deduplication config exists
	if (config.has('customer.deduplication')) {
		const deduplicationConfig = config.get('customer.deduplication') as any;

		// Validate 'enabled' field
		if (!Object.prototype.hasOwnProperty.call(deduplicationConfig, 'enabled')) {
			errors.push('customer.deduplication.enabled is required when customer.deduplication is configured.');
		} else if (typeof deduplicationConfig.enabled !== 'boolean') {
			errors.push('customer.deduplication.enabled must be a boolean value.');
		}
	}

	if (errors.length) {
		throw new ConfigValidationError(
			'Invalid deduplication configuration. Please check your configuration file.',
			errors,
		);
	}
};
