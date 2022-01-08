## EKS Secrets Generator From AWS Secrets Manager
If your environment vars are located on AWS Secrets Manager you can get and convert into a secret file for your EKS applications and pods. 

## Ussage

```yaml
      - name: Getting secrets 
        uses: condorlabs-actions/k8s-secrets-manager
        with: 
          AWS_EKS_ACCESS_KEY: ${{ secrets.AWS_ACCESS_KEY }}
          AWS_EKS_SECRET_KEY: ${{ secrets.AWS_SECRET_KEY }}
          eks_secrets_configs: '[{ "secret_name": "test/kuntur/bot", "output_secret_name": "kuntur-secrets-eks" }]'
          output_secret_namespace: 'kunturapp'
          output_type: 'yaml'
      - name: Send secrets to k8s
        run: kubectl apply -f output.yaml
```

## Contributors

The original author and current lead maintainer of this module is the [@condor-labs development team](https://condorlabs.io/team).

Join to our team. 

**Join to our Team [Here](https://condorlabs.io/hiring).**

**More about Condorlabs [Here](https://condorlabs.io/about).**

## License

[MIT](LICENSE)