const User = require("./../models/User");

const generateWalletId = () => {
    let wId = "";
    do {
        async function genWId() {
            try {
                let wallletId = ((Math.random() + 0.1) * 100000000000).toString().substring(0, 10);
                let findWId = await User.find({ walletId: wallletId });
                do {
                    wallletId = ((Math.random() + 0.1) * 100000000000).toString().substring(0, 10);
                    findWId = await User.find({ walletId: wallletId });
                } while(findWId.length > 0);
                return wallletId;
            } catch(error) {
                console.log(error)
            }
        }
        
        Promise.all([genWId()]).then((values) => {
            wId = values[0];
        });
        return wId;
    } while(wId === "" );
}

module.exports = generateWalletId;

