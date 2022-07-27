/** 
 * @class
 * @hideconstructor
 * @classdesc Document object, represents an opened document in the editor
 */
export class Storage
{
	constructor()
	{
	}
	
	/**
	 * Save value into persistency data
	 * @param key {string} the key
	 * @param value {string} the value
	 */
	async setValue(key, value){}

	/**
	 * Get value value persistency data
	 * @param key {string} the key
	 * @return {string} the value
	 */
	async getValue(key){}
}
