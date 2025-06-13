import cf from 'cloudfront';

const COOKIE_NAME = 'aoe_auth_token';

async function getSecret(key) {
	try {
		const kvsHandle = cf.kvs();
		return await kvsHandle.get(key);
	} catch (err) {
		return null;
	}
}

async function generateAuthToken() {
	const tokensecret = await getSecret('tokensecret');
	const username = await getSecret('username');
	return Buffer.from(`${username}:${tokensecret}`).toString('base64');
}

async function handler(event) {
	const response = event.response;

	const authToken = await generateAuthToken();

	response.cookies = response.cookies || {};
	response.cookies[COOKIE_NAME] = {
		value: authToken,
		attributes: 'Path=/; HttpOnly; Secure; SameSite=Strict',
	};

	return response;
}