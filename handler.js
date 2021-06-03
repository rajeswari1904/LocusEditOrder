'use strict';
const axios = require('axios');

module.exports.editOrder = async (event) => {
  try {
    var locusData = editConvertionJson(event);
    const response = await doRequest(locusData);
    console.info("Edit  Order  Success");
    console.info(response);
    return response;
  }
  catch (err) {
    console.error(err);
    console.info("Edit Order Faild");
    var count = 0;
    var maxTries = 3;
    while (count < 3) {
      console.log("loop")
      console.info(count);
      try {
        var locusData = editConvertionJson(event);
        const response = await doRequest(locusData);
        return response;

      } catch (err) {
        count = count + 1;
        if (count == maxTries) {
          var statuscode = (err.status) ? err.status : 400;
          var statusError = (err.error) ? err.error : err.message;
          return ({ statusCode: err.response.status, body: JSON.stringify(err.response.data) });
        }
      }
    }
  }

};

function editConvertionJson(event) {
  try {
    var locusData = {};
    var lineItems = [];
    var patchBody = {}
    var skills = [];
    var customProperties = {}
    var teamId = null;
    var scanId = null;
    var pickupSlots = [];
    var dropVisitName = null;
    var dropLocationAddress = {};
    var dropContactPoint = {};
    var dropTransactionDuration =(20 * 60);
    const eventreq = JSON.parse(event.body);
    console.log(eventreq);
    eventreq.data.custom_fields_listing.forEach(res => {
      customProperties[res.name] = res.value;
      if (res.name == 'Skills') {
        var str = res.value;
        skills = str.split(",");
      }
      if (res.name == 'Team ID') {
        teamId = res.value;
      }
      if (res.name == 'Scan ID') {
        scanId = res.value;
      }
      if (res.name == 'Drop Transaction Duration (mins)') {
        dropTransactionDuration = (res.value * 60);
      }
    });
    eventreq.data.order_items.forEach(res => {
      var price = {};
      price.amount = res.price,
        price.currency = eventreq.data.currency;
      price.symbol = eventreq.data.currency;

      var parts = []
      lineItems.push({
        note: res.note,
        name: res.name,
        id: res.sku,
        lineItemId: res.item_id,
        quantity: res.quantity_ordered,
        quantityUnit: "PC",
        price: price,
        parts: parts

      });
    });

    var shipres = (eventreq.data.shipping_address) ? eventreq.data.shipping_address : null;
    if (shipres) {
      dropVisitName = shipres.name
      dropContactPoint.name = shipres.name;
      dropContactPoint.number = shipres.contact_number;
      dropLocationAddress.id = null;
      dropLocationAddress.placeName = shipres.company;
      dropLocationAddress.localityName = shipres.address2;
      dropLocationAddress.formattedAddress = shipres.address1;
      dropLocationAddress.subLocalityName = null;
      dropLocationAddress.pincode = shipres.zipcode;
      dropLocationAddress.city = shipres.country;
      dropLocationAddress.state = shipres.state;
      dropLocationAddress.countryCode = shipres.country_code;
      dropLocationAddress.locationType = null;
      dropLocationAddress.placeHash = null;
    }
    var amount = {};

    amount.amount = eventreq.data.total;
    amount.currency = eventreq.data.currency;
    amount.symbol = eventreq.data.currency;
    var dropAmount = {
      amount: amount,
      exchangeType: "NONE"
    };
    var dropSlot = {};
    dropSlot.start = new Date(eventreq.data.delivery_date).toISOString();
    dropSlot.end = new Date(eventreq.data.delivery_date).toISOString();
    locusData.id = eventreq.data.id;
    locusData.clientId = "arki-devo";
    patchBody.customProperties = customProperties;
    patchBody.lineItems = lineItems;
    patchBody.code = eventreq.data.channel_order_id;
    patchBody.name = eventreq.data.channel_order_number;
    patchBody.skills = skills;
    patchBody.temperatureThreshold = null;
    patchBody.customFields = null;
    patchBody.shiftId = null;
    patchBody.scanId = scanId;
    patchBody.pickupVisitName = eventreq.data.warehouse_id,
      patchBody.pickupLocationId = eventreq.data.warehouse_id,
      patchBody.teamId = teamId;
    patchBody.pickupLatLng = null;
    patchBody.pickupDate = null;
    patchBody.pickupSlot = null;
    patchBody.pickupSlots = pickupSlots;
    patchBody.pickupTransactionDuration = null;
    patchBody.pickupAmount = null;
    patchBody.pickupAppFields = null;
    patchBody.pickupCustomerId = null;
    patchBody.pickupAddressId = null;
    patchBody.dropVisitName = dropVisitName;
    patchBody.dropLocationId = null;
    patchBody.dropContactPoint = dropContactPoint;
    patchBody.dropLocationAddress = dropLocationAddress;
    patchBody.pickupContactPoint = null;
    patchBody.pickupLocationAddress = null;
    patchBody.dropLatLng = null;
    patchBody.shippingDueDate = null;
    var dropdate = new Date(eventreq.data.delivery_date).toISOString().split('T');
    patchBody.dropDate = dropdate[0];
    patchBody.dropSlotStart = null;
    patchBody.dropSlotEnd = null;
    patchBody.dropSlot = dropSlot;
    patchBody.dropSlots = null;
    patchBody.dropTransactionDuration = dropTransactionDuration;
    patchBody.transactionDuration = null;
    p
    atchBody.dropAmount = dropAmount;
    patchBody.exchangeType = null;
    patchBody.dropAppFields = null;
    patchBody.dropCustomerId = null;
    patchBody.dropAddressId = null;
    patchBody.volume = null;
    patchBody.weight = null;
    var orderedOn = new Date(eventreq.data.sync_created).toISOString().split('T');
    patchBody.orderedOn = orderedOn[0];
    patchBody.createdOn = eventreq.data.created_date;
    locusData.patchBody = patchBody;
    console.info(JSON.stringify(locusData));
    return locusData;
 }catch (err) {
    console.log("covertion error");
    console.error(err);
 }

}

function doRequest(locusData) {
  try {
    var data = locusData;
    const clientId = data.clientId;
    const id = data.id;
    const username = 'arki-devo'
    const password = '167eb8d0-aab4-44e0-99c4-0469945d2bae'
    const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
    const url = 'https://oms.locus-api.com/v1/client/' + clientId + '/order/' + id;
    console.info(url);
    const response = new Promise((resolve, reject) => {
      axios.post(url, locusData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${token}`
        }
      }).then((res) => {
        console.info("Locus Edit URl Success");
        resolve({
          statusCode: 200,
          body: JSON.stringify(res.data)
        });
      })
        .catch((error) => {
          console.info("Locus edit  URl Error");
          console.log(error);
          reject(error);
        });
    })
    console.info(response);
    return response;
  }
  catch (error) {
    console.info(error);
    console.error("doRequest Edit  Catch Handling");

  }

}

