Ne pas utiliser pubsub pour la prod: https://www.apollographql.com/docs/apollo-server/data/subscriptions/#production-pubsub-libraries

En prod, on le laisserait pas la query messages qui permet de lire tous les messages ouvertes, on filtrerait en fonction des droits utilisateurs

Les subscriptions fonctionnent avec le protocole socket. On fait ici l'auth à 2 endroits différents en fonction du protocole utilisé (socket ou non). Si on passe par du socket on fait cette vérification dans le "onConnect" et on passe le user à travers l'objet "connection" qu'on retrouve en plus de l'objet "req" dans la fonction context.

On retourne ensuite ce user tel quel, car on a déjà vérifié le jwt dans le onConnect.

La subscription newMessage utilise withFilter qui nous permet ensuite de vérifier parmis tous les clients qui ont souscrit l'évènement "NEW_MESSAGE" si le payload (ce qu'on va envoyer) leur est destiné. La 2ème fonction en paramètre de withFilter a accès à la fois au payload (ce qu'on va envoyer) et au context qui a servi à souscrire à cet évènement. On vérifie dans notre cas que le user du payload, le destinataire du message, correspond bien au user du context, afin de n'evoyer le message qu'à son destinataire.

On aurait pu faire n'importe quelle autre vérification, par si on avait un système de conversations, vérifier que l'user fait partie de la conversation dans laquelle le message est envoyé.