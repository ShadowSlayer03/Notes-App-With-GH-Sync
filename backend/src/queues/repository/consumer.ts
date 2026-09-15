import { RepositoryJob } from "../types";
import ensureRepository from "./handlers/ensureRepository";

const repositoryConsumer = async(batch: MessageBatch<RepositoryJob>, env: Env) => {
    for(const message of batch.messages){
        switch(message.body.type){
            case 'ensure-repository':
                await ensureRepository(message.body, env);
                message.ack();
                break;
        }
    }
}

export default repositoryConsumer;