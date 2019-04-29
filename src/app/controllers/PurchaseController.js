const Ad = require("../models/Ad");
const User = require("../models/User");
const Purchase = require("../models/Purchase")
const Mail = require("../services/Mail");
const Queue = require('../services/Queue')
const PurchaseMail = require('../jobs/PurchaseMail')

class PurchaseController {
  async store(req, res) {
    const { ad, content } = req.body;

    const purchaseAd = await Ad.findById(ad).populate("author");
    const user = await User.findById(req.userId);

    const purchase = await Purchase.create({
      ad,
      content,
      user: user.id
    })
    
    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.send(purchase);
  }

  async approvePurchase(req, res) {
    const {id} = req.params
    const purchase = await Purchase.findById(id).populate({
      path: 'ad',
      populate: {
        path: 'author'
      }
    })

    if(purchase.ad.author._id.equals(req.userId)){
      return res.status(401).json({error: "You're not be author"})
    }

    if(purchase.ad.purchasedBy){
      return res.status(401).json({error: "this ad already purchased"})
    }
    const {ad} = purchase
    ad.purchasedBy = id

    await ad.save()

    return res.json(ad)
  }
}

module.exports = new PurchaseController();
