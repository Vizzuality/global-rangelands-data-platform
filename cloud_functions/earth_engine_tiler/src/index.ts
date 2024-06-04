import {HttpFunction} from "@google-cloud/functions-framework";

export const getTiles: HttpFunction = async (req, res) => {

    res.status(200).send('Here is your data');
}